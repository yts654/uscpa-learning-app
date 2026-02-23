import { z } from "zod"

const envSchema = z.object({
  // Auth (required)
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional(),

  // Redis (required)
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),

  // Admin account (optional, env-based)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH_B64: z.string().min(1).optional(),

  // Demo account (optional, env-based — never hardcoded)
  DEMO_EMAIL: z.string().email().optional(),
  DEMO_PASSWORD_HASH_B64: z.string().min(1).optional(),

  // External services (optional)
  OPENROUTER_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),

  // Runtime
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VERCEL_URL: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")
    throw new Error(
      `[config] Environment validation failed:\n${formatted}\n\nPlease set the required environment variables before starting the application.`
    )
  }
  return result.data
}

let _env: Env | null = null

export function env(): Env {
  if (!_env) {
    _env = loadEnv()
  }
  return _env
}
