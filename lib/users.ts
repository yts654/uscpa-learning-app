import bcrypt from "bcryptjs"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
  emailVerified: boolean
  verificationToken: string | null
}

// ---------------------------------------------------------------------------
// In-memory store (primary on Vercel; works across requests in same instance)
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, User>()

function key(email: string) {
  return email.toLowerCase()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<User | null> {
  return memoryStore.get(key(email)) ?? null
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
    emailVerified: false,
    verificationToken: crypto.randomUUID(),
  }

  memoryStore.set(key(email), user)
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
  user.passwordHash = await bcrypt.hash(newPassword, 10)
  memoryStore.set(key(email), user)
  return true
}

export async function verifyEmailToken(token: string): Promise<User | null> {
  for (const user of memoryStore.values()) {
    if (user.verificationToken === token) {
      user.emailVerified = true
      user.verificationToken = null
      memoryStore.set(key(user.email), user)
      return user
    }
  }
  return null
}

export async function regenerateVerificationToken(email: string): Promise<string | null> {
  const user = await getUserByEmail(email)
  if (!user || user.emailVerified) return null
  user.verificationToken = crypto.randomUUID()
  memoryStore.set(key(email), user)
  return user.verificationToken
}

export async function updateUserProfile(email: string, updates: { name?: string; newEmail?: string }): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  if (updates.name) user.name = updates.name

  if (updates.newEmail && updates.newEmail.toLowerCase() !== email.toLowerCase()) {
    const existing = await getUserByEmail(updates.newEmail)
    if (existing) return false

    memoryStore.delete(key(email))
    user.email = updates.newEmail.toLowerCase()
    memoryStore.set(key(user.email), user)
    return true
  }

  memoryStore.set(key(user.email), user)
  return true
}
