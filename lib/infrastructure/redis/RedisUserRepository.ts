import crypto from "crypto"
import { Redis } from "@upstash/redis"
import type { User } from "@/lib/domain/models/User"
import type { UserRepository } from "@/lib/domain/repositories/UserRepository"
import { ConflictError, DatabaseError } from "@/lib/domain/errors"
import { env } from "@/lib/config"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCKOUT_DURATION_SEC = 15 * 60 // 15 minutes
const EVENT_TTL_SEC = 24 * 60 * 60   // 24 hours

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

function userKey(userId: string) { return `user:${userId}` }
function emailIndexKey(email: string) { return `email_to_id:${email.toLowerCase()}` }
function stripeCustomerKey(customerId: string) { return `stripe_customer:${customerId}` }
function loginAttemptsKey(email: string) { return `login_attempts:${email.toLowerCase()}` }
function eventKey(eventId: string) { return `processed_event:${eventId}` }

// ---------------------------------------------------------------------------
// AES-256-GCM Encryption
// ---------------------------------------------------------------------------

function getEncryptionKey(): Buffer {
  const secret = env().NEXTAUTH_SECRET
  return crypto.scryptSync(secret, "uscpa-pii-salt", 32)
}

function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`
}

function decrypt(ciphertext: string): string {
  const key = getEncryptionKey()
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":")
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted data format")
  }
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const encrypted = Buffer.from(encryptedHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final("utf8")
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

function serialize(user: User): Record<string, string> {
  return {
    id: user.id,
    name: encrypt(user.name),
    email: encrypt(user.email),
    emailHash: user.email.toLowerCase(),
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    plan: user.plan,
    ...(user.stripeCustomerId ? { stripeCustomerId: user.stripeCustomerId } : {}),
    ...(user.stripeSubscriptionId ? { stripeSubscriptionId: user.stripeSubscriptionId } : {}),
    ...(user.planExpiresAt ? { planExpiresAt: user.planExpiresAt } : {}),
  }
}

function deserialize(data: Record<string, string>): User | null {
  if (!data || !data.id) return null
  try {
    return {
      id: data.id,
      name: decrypt(data.name),
      email: decrypt(data.email),
      passwordHash: data.passwordHash,
      createdAt: data.createdAt,
      plan: (data.plan as "free" | "pro") || "free",
      stripeCustomerId: data.stripeCustomerId || undefined,
      stripeSubscriptionId: data.stripeSubscriptionId || undefined,
      planExpiresAt: data.planExpiresAt || undefined,
    }
  } catch {
    // Migration fallback: read plain text if decryption fails
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt,
      plan: (data.plan as "free" | "pro") || "free",
      stripeCustomerId: data.stripeCustomerId || undefined,
      stripeSubscriptionId: data.stripeSubscriptionId || undefined,
      planExpiresAt: data.planExpiresAt || undefined,
    }
  }
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class RedisUserRepository implements UserRepository {
  constructor(private readonly redis: Redis) {}

  async findById(userId: string): Promise<User | null> {
    try {
      const data = await this.redis.hgetall<Record<string, string>>(userKey(userId))
      if (!data || !data.id) return null
      return deserialize(data)
    } catch (e) {
      throw new DatabaseError("Failed to find user by ID", e)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userId = await this.redis.get<string>(emailIndexKey(email))
      if (!userId) return null
      return this.findById(userId)
    } catch (e) {
      throw new DatabaseError("Failed to find user by email", e)
    }
  }

  async findByStripeCustomerId(customerId: string): Promise<User | null> {
    try {
      const userId = await this.redis.get<string>(stripeCustomerKey(customerId))
      if (!userId) return null
      return this.findById(userId)
    } catch (e) {
      throw new DatabaseError("Failed to find user by Stripe customer ID", e)
    }
  }

  async save(user: User): Promise<void> {
    try {
      await this.redis.hset(userKey(user.id), serialize(user))
    } catch (e) {
      throw new DatabaseError("Failed to save user", e)
    }
  }

  async create(user: User): Promise<void> {
    const normalizedEmail = user.email.toLowerCase()
    try {
      // Atomic check-and-set using SETNX to prevent race conditions
      const wasSet = await this.redis.setnx(emailIndexKey(normalizedEmail), user.id)
      if (!wasSet) {
        throw new ConflictError("An account with this email already exists")
      }

      // Store user data
      await this.redis.hset(userKey(user.id), serialize(user))
    } catch (e) {
      if (e instanceof ConflictError) throw e
      // Rollback the index if user data write failed
      await this.redis.del(emailIndexKey(normalizedEmail)).catch(() => {})
      throw new DatabaseError("Failed to create user", e)
    }
  }

  async updateFields(userId: string, fields: Partial<Pick<User, "name" | "email" | "passwordHash" | "plan" | "stripeCustomerId" | "stripeSubscriptionId" | "planExpiresAt">>): Promise<void> {
    try {
      const updates: Record<string, string> = {}
      if (fields.name) updates.name = encrypt(fields.name)
      if (fields.email) updates.email = encrypt(fields.email)
      if (fields.passwordHash) updates.passwordHash = fields.passwordHash
      if (fields.plan) updates.plan = fields.plan
      if (fields.stripeCustomerId) updates.stripeCustomerId = fields.stripeCustomerId
      if (fields.stripeSubscriptionId) updates.stripeSubscriptionId = fields.stripeSubscriptionId
      if (fields.planExpiresAt) updates.planExpiresAt = fields.planExpiresAt

      if (Object.keys(updates).length > 0) {
        await this.redis.hset(userKey(userId), updates)
      }
    } catch (e) {
      throw new DatabaseError("Failed to update user fields", e)
    }
  }

  async updateEmail(userId: string, oldEmail: string, newEmail: string): Promise<void> {
    const newEmailLower = newEmail.toLowerCase()
    const oldEmailLower = oldEmail.toLowerCase()

    try {
      // Atomic check-and-set for new email
      const wasSet = await this.redis.setnx(emailIndexKey(newEmailLower), userId)
      if (!wasSet) {
        throw new ConflictError("An account with this email already exists")
      }

      // Update user record
      await this.redis.hset(userKey(userId), {
        email: encrypt(newEmailLower),
        emailHash: newEmailLower,
      })

      // Remove old index
      await this.redis.del(emailIndexKey(oldEmailLower))
    } catch (e) {
      if (e instanceof ConflictError) throw e
      // Rollback: remove new index on failure
      await this.redis.del(emailIndexKey(newEmailLower)).catch(() => {})
      throw new DatabaseError("Failed to update email", e)
    }
  }

  async updatePlan(userId: string, plan: "free" | "pro", stripeCustomerId?: string, stripeSubscriptionId?: string, planExpiresAt?: string): Promise<void> {
    try {
      const updates: Record<string, string> = { plan }
      if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId
      if (stripeSubscriptionId) updates.stripeSubscriptionId = stripeSubscriptionId
      if (planExpiresAt) updates.planExpiresAt = planExpiresAt

      await this.redis.hset(userKey(userId), updates)

      if (stripeCustomerId) {
        await this.redis.set(stripeCustomerKey(stripeCustomerId), userId)
      }
    } catch (e) {
      throw new DatabaseError("Failed to update user plan", e)
    }
  }

  // -- Login attempt tracking --

  async getLoginAttempts(email: string): Promise<number> {
    try {
      const count = await this.redis.get<number>(loginAttemptsKey(email))
      return count ?? 0
    } catch (e) {
      throw new DatabaseError("Failed to get login attempts", e)
    }
  }

  async incrementLoginAttempts(email: string): Promise<number> {
    try {
      const key = loginAttemptsKey(email)
      const count = await this.redis.incr(key)
      if (count === 1) {
        await this.redis.expire(key, LOCKOUT_DURATION_SEC)
      }
      return count
    } catch (e) {
      throw new DatabaseError("Failed to increment login attempts", e)
    }
  }

  async resetLoginAttempts(email: string): Promise<void> {
    try {
      await this.redis.del(loginAttemptsKey(email))
    } catch (e) {
      throw new DatabaseError("Failed to reset login attempts", e)
    }
  }

  // -- Webhook idempotency --

  async isEventProcessed(eventId: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(eventKey(eventId))
      return exists === 1
    } catch (e) {
      throw new DatabaseError("Failed to check event idempotency", e)
    }
  }

  async markEventProcessed(eventId: string): Promise<void> {
    try {
      await this.redis.set(eventKey(eventId), "1", { ex: EVENT_TTL_SEC })
    } catch (e) {
      throw new DatabaseError("Failed to mark event as processed", e)
    }
  }
}
