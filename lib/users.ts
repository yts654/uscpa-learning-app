import { Redis } from "@upstash/redis"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error("REDIS_NOT_CONFIGURED")
  return new Redis({ url, token })
}

function key(email: string) {
  return `user:${email.toLowerCase()}`
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const redis = getRedis()
  return await redis.get<User>(key(email))
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const existing = await getUserByEmail(email)
  if (existing) throw new Error("USER_EXISTS")

  const hash = await bcrypt.hash(password, 12)
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  }
  const redis = getRedis()
  await redis.set(key(email), user)
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
  user.passwordHash = await bcrypt.hash(newPassword, 12)
  const redis = getRedis()
  await redis.set(key(email), user)
  return true
}

export async function updateUserProfile(email: string, updates: { name?: string; newEmail?: string }): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  if (updates.name) user.name = updates.name

  const redis = getRedis()
  if (updates.newEmail && updates.newEmail.toLowerCase() !== email.toLowerCase()) {
    const existing = await getUserByEmail(updates.newEmail)
    if (existing) return false
    await redis.del(key(email))
    user.email = updates.newEmail.toLowerCase()
  }

  await redis.set(key(user.email), user)
  return true
}
