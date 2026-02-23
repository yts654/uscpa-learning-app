import bcrypt from "bcryptjs"
import crypto from "crypto"
import { getRedis } from "./redis"
import { env } from "./config"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  plan: "free" | "pro"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  planExpiresAt?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_COST = 12
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_SEC = 15 * 60 // 15 minutes

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

function userKey(userId: string) {
  return `user:${userId}`
}

function emailIndexKey(email: string) {
  return `email_to_id:${email.toLowerCase()}`
}

function stripeCustomerKey(customerId: string) {
  return `stripe_customer:${customerId}`
}

function loginAttemptsKey(email: string) {
  return `login_attempts:${email.toLowerCase()}`
}

// ---------------------------------------------------------------------------
// AES-256-GCM Encryption for PII
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
  // Format: iv:authTag:ciphertext (all hex)
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
// Internal helpers
// ---------------------------------------------------------------------------

function serializeUser(user: User): Record<string, string> {
  return {
    id: user.id,
    name: encrypt(user.name),
    email: encrypt(user.email),
    emailHash: user.email.toLowerCase(), // for reverse lookup verification
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    plan: user.plan,
    ...(user.stripeCustomerId ? { stripeCustomerId: user.stripeCustomerId } : {}),
    ...(user.stripeSubscriptionId ? { stripeSubscriptionId: user.stripeSubscriptionId } : {}),
    ...(user.planExpiresAt ? { planExpiresAt: user.planExpiresAt } : {}),
  }
}

function deserializeUser(data: Record<string, string>): User | null {
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
    // If decryption fails, try reading as plain text (migration period)
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
// Account lockout helpers
// ---------------------------------------------------------------------------

async function getLoginAttempts(email: string): Promise<number> {
  const redis = getRedis()
  const count = await redis.get<number>(loginAttemptsKey(email))
  return count ?? 0
}

async function incrementLoginAttempts(email: string): Promise<number> {
  const redis = getRedis()
  const key = loginAttemptsKey(email)
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, LOCKOUT_DURATION_SEC)
  }
  return count
}

async function resetLoginAttempts(email: string): Promise<void> {
  const redis = getRedis()
  await redis.del(loginAttemptsKey(email))
}

function isAccountLocked(attempts: number): boolean {
  return attempts >= MAX_LOGIN_ATTEMPTS
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getUserById(userId: string): Promise<User | null> {
  const redis = getRedis()
  const data = await redis.hgetall<Record<string, string>>(userKey(userId))
  if (!data || !data.id) return null
  return deserializeUser(data)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const redis = getRedis()
  const userId = await redis.get<string>(emailIndexKey(email))
  if (!userId) return null
  return getUserById(userId)
}

export async function getUserByStripeCustomerId(customerId: string): Promise<User | null> {
  const redis = getRedis()
  const userId = await redis.get<string>(stripeCustomerKey(customerId))
  if (!userId) return null
  return getUserById(userId)
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const redis = getRedis()
  const normalizedEmail = email.toLowerCase()

  // Check if email already exists
  const existingId = await redis.get<string>(emailIndexKey(normalizedEmail))
  if (existingId) throw new Error("USER_EXISTS")

  const hash = await bcrypt.hash(password, BCRYPT_COST)
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    plan: "free",
  }

  // Store user data and email index
  await redis.hset(userKey(user.id), serializeUser(user))
  await redis.set(emailIndexKey(normalizedEmail), user.id)

  return user
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase()

  // Check lockout
  const attempts = await getLoginAttempts(normalizedEmail)
  if (isAccountLocked(attempts)) {
    throw new Error("ACCOUNT_LOCKED")
  }

  const user = await getUserByEmail(normalizedEmail)
  if (!user) {
    // Increment attempts even if user doesn't exist (prevent enumeration)
    await incrementLoginAttempts(normalizedEmail)
    return null
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    await incrementLoginAttempts(normalizedEmail)
    return null
  }

  // Success — reset attempts
  await resetLoginAttempts(normalizedEmail)
  return user
}

export async function updatePassword(email: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const user = await verifyUser(email, currentPassword)
  if (!user) return false

  const redis = getRedis()
  const newHash = await bcrypt.hash(newPassword, BCRYPT_COST)
  await redis.hset(userKey(user.id), { passwordHash: newHash })

  return true
}

export async function updateUserProfile(email: string, updates: { name?: string; newEmail?: string }): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  const redis = getRedis()

  if (updates.newEmail && updates.newEmail.toLowerCase() !== email.toLowerCase()) {
    const newEmailLower = updates.newEmail.toLowerCase()

    // Check if new email is already taken
    const existingId = await redis.get<string>(emailIndexKey(newEmailLower))
    if (existingId) return false

    const updatedUser: User = {
      ...user,
      name: updates.name ?? user.name,
      email: newEmailLower,
    }

    // Atomic-ish update: set new index, update user data, delete old index
    await redis.set(emailIndexKey(newEmailLower), user.id)
    await redis.hset(userKey(user.id), serializeUser(updatedUser))
    await redis.del(emailIndexKey(email.toLowerCase()))

    return true
  }

  // Name-only update
  if (updates.name) {
    await redis.hset(userKey(user.id), {
      name: encrypt(updates.name),
    })
  }

  return true
}

export async function updateUserPlan(
  email: string,
  plan: "free" | "pro",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  planExpiresAt?: string,
): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  const redis = getRedis()
  const updates: Record<string, string> = { plan }
  if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId
  if (stripeSubscriptionId) updates.stripeSubscriptionId = stripeSubscriptionId
  if (planExpiresAt) updates.planExpiresAt = planExpiresAt

  await redis.hset(userKey(user.id), updates)

  if (stripeCustomerId) {
    await redis.set(stripeCustomerKey(stripeCustomerId), user.id)
  }

  return true
}
