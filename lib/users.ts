import { kv } from "@vercel/kv"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

function key(email: string) {
  return `user:${email.toLowerCase()}`
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await kv.get<User>(key(email))
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
  await kv.set(key(email), user)
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
  await kv.set(key(email), user)
  return true
}

export async function updateUserProfile(email: string, updates: { name?: string; newEmail?: string }): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  if (updates.name) user.name = updates.name

  if (updates.newEmail && updates.newEmail.toLowerCase() !== email.toLowerCase()) {
    const existing = await getUserByEmail(updates.newEmail)
    if (existing) return false
    await kv.del(key(email))
    user.email = updates.newEmail.toLowerCase()
  }

  await kv.set(key(user.email), user)
  return true
}
