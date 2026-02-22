import bcrypt from "bcryptjs"
import { getRedis } from "./redis"

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

function userKey(email: string) {
  return `user:${email.toLowerCase()}`
}

function stripeCustomerKey(customerId: string) {
  return `stripe_customer:${customerId}`
}

// ---------------------------------------------------------------------------
// Redis-based persistence (falls back to in-memory if Redis not configured)
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, User>()

function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isRedisConfigured()) {
    return memoryStore.get(email.toLowerCase()) ?? null
  }
  try {
    const redis = getRedis()
    const data = await redis.hgetall<Record<string, string>>(userKey(email))
    if (!data || !data.id) return null
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
  } catch (e) {
    console.error("[users] Redis getUserByEmail error:", e)
    return memoryStore.get(email.toLowerCase()) ?? null
  }
}

export async function getUserByStripeCustomerId(customerId: string): Promise<User | null> {
  if (!isRedisConfigured()) return null
  try {
    const redis = getRedis()
    const email = await redis.get<string>(stripeCustomerKey(customerId))
    if (!email) return null
    return getUserByEmail(email)
  } catch (e) {
    console.error("[users] Redis getUserByStripeCustomerId error:", e)
    return null
  }
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const existing = await getUserByEmail(email)
  if (existing) throw new Error("USER_EXISTS")

  const hash = await bcrypt.hash(password, 10)
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    plan: "free",
  }

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()
      await redis.hset(userKey(user.email), {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        plan: user.plan,
      })
    } catch (e) {
      console.error("[users] Redis createUser error:", e)
    }
  }

  memoryStore.set(user.email, user)
  return user
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  return valid ? user : null
}

export async function updatePassword(email: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const user = await verifyUser(email, currentPassword)
  if (!user) return false

  const newHash = await bcrypt.hash(newPassword, 10)
  user.passwordHash = newHash

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()
      await redis.hset(userKey(user.email), { passwordHash: newHash })
    } catch (e) {
      console.error("[users] Redis updatePassword error:", e)
    }
  }

  memoryStore.set(user.email, user)
  return true
}

export async function updateUserProfile(email: string, updates: { name?: string; newEmail?: string }): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  if (updates.name) user.name = updates.name

  if (updates.newEmail && updates.newEmail.toLowerCase() !== email.toLowerCase()) {
    const existing = await getUserByEmail(updates.newEmail)
    if (existing) return false

    if (isRedisConfigured()) {
      try {
        const redis = getRedis()
        await redis.del(userKey(email))
        user.email = updates.newEmail.toLowerCase()
        await redis.hset(userKey(user.email), {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
          plan: user.plan,
          ...(user.stripeCustomerId ? { stripeCustomerId: user.stripeCustomerId } : {}),
          ...(user.stripeSubscriptionId ? { stripeSubscriptionId: user.stripeSubscriptionId } : {}),
          ...(user.planExpiresAt ? { planExpiresAt: user.planExpiresAt } : {}),
        })
      } catch (e) {
        console.error("[users] Redis updateUserProfile error:", e)
      }
    }

    memoryStore.delete(email.toLowerCase())
    user.email = updates.newEmail.toLowerCase()
    memoryStore.set(user.email, user)
    return true
  }

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()
      await redis.hset(userKey(user.email), { name: user.name })
    } catch (e) {
      console.error("[users] Redis updateUserProfile error:", e)
    }
  }

  memoryStore.set(user.email, user)
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

  user.plan = plan
  if (stripeCustomerId) user.stripeCustomerId = stripeCustomerId
  if (stripeSubscriptionId) user.stripeSubscriptionId = stripeSubscriptionId
  if (planExpiresAt) user.planExpiresAt = planExpiresAt

  const updates: Record<string, string> = { plan }
  if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId
  if (stripeSubscriptionId) updates.stripeSubscriptionId = stripeSubscriptionId
  if (planExpiresAt) updates.planExpiresAt = planExpiresAt

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()
      await redis.hset(userKey(user.email), updates)
      if (stripeCustomerId) {
        await redis.set(stripeCustomerKey(stripeCustomerId), user.email)
      }
    } catch (e) {
      console.error("[users] Redis updateUserPlan error:", e)
    }
  }

  memoryStore.set(user.email, user)
  return true
}
