import bcrypt from "bcryptjs"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Storage helpers – file-based JSON (/tmp on Vercel, .data locally)
// ---------------------------------------------------------------------------

const DATA_DIR = process.env.VERCEL
  ? join("/tmp", ".data")
  : join(process.cwd(), ".data")
const USERS_FILE = join(DATA_DIR, "users.json")

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readUsers(): Record<string, User> {
  ensureDataDir()
  if (!existsSync(USERS_FILE)) return {}
  try {
    return JSON.parse(readFileSync(USERS_FILE, "utf-8"))
  } catch {
    return {}
  }
}

function writeUsers(users: Record<string, User>) {
  ensureDataDir()
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
}

function key(email: string) {
  return email.toLowerCase()
}

// ---------------------------------------------------------------------------
// Optional Redis support – only used when env vars are present
// ---------------------------------------------------------------------------

function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    // Dynamic require to avoid crashing when @upstash/redis isn't installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis")
    return new Redis({ url, token })
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<User | null> {
  const redis = getRedis()
  if (redis) {
    try {
      return await redis.get<User>(`user:${key(email)}`)
    } catch {
      // fall through to file
    }
  }
  const users = readUsers()
  return users[key(email)] ?? null
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
  if (redis) {
    try {
      await redis.set(`user:${key(email)}`, user)
      return user
    } catch {
      // fall through to file
    }
  }

  const users = readUsers()
  users[key(email)] = user
  writeUsers(users)
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
  if (redis) {
    try {
      await redis.set(`user:${key(email)}`, user)
      return true
    } catch {
      // fall through to file
    }
  }

  const users = readUsers()
  users[key(email)] = user
  writeUsers(users)
  return true
}

export async function updateUserProfile(email: string, updates: { name?: string; newEmail?: string }): Promise<boolean> {
  const user = await getUserByEmail(email)
  if (!user) return false

  if (updates.name) user.name = updates.name

  if (updates.newEmail && updates.newEmail.toLowerCase() !== email.toLowerCase()) {
    const existing = await getUserByEmail(updates.newEmail)
    if (existing) return false

    // Remove old key
    const users = readUsers()
    delete users[key(email)]
    user.email = updates.newEmail.toLowerCase()
    users[key(user.email)] = user
    writeUsers(users)

    const redis = getRedis()
    if (redis) {
      try {
        await redis.del(`user:${key(email)}`)
        await redis.set(`user:${key(user.email)}`, user)
      } catch {
        // file already updated above
      }
    }
    return true
  }

  const redis = getRedis()
  if (redis) {
    try {
      await redis.set(`user:${key(user.email)}`, user)
      return true
    } catch {
      // fall through to file
    }
  }

  const users = readUsers()
  users[key(user.email)] = user
  writeUsers(users)
  return true
}
