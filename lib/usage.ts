import { getRedis } from "./redis"
import { PLAN_LIMITS, type Plan } from "./ai-models"

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`
}

function usageKey(email: string): string {
  return `usage:${email.toLowerCase()}:${currentMonth()}`
}

function rateLimitKey(email: string, endpoint: string): string {
  return `ratelimit:${email.toLowerCase()}:${endpoint}`
}

export async function getUsage(email: string, plan: Plan) {
  const redis = getRedis()
  const key = usageKey(email)
  const used = (await redis.get<number>(key)) || 0
  const limit = PLAN_LIMITS[plan]
  return { used, limit, remaining: Math.max(0, limit - used) }
}

export async function incrementUsage(email: string): Promise<number> {
  const redis = getRedis()
  const key = usageKey(email)
  const newCount = await redis.incr(key)
  // Set TTL to 45 days on first use (auto-cleanup)
  if (newCount === 1) {
    await redis.expire(key, 45 * 24 * 60 * 60)
  }
  return newCount
}

export async function checkRateLimit(email: string, endpoint: string): Promise<boolean> {
  const redis = getRedis()
  const key = rateLimitKey(email, endpoint)
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 60) // 1-minute window
  }
  return count <= 5 // 5 requests per minute
}
