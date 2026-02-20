import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const secret = process.env.NEXTAUTH_SECRET || "fallback-dev-secret-change-in-production"

export const authOptions: NextAuthOptions = {
  secret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Try Redis database first (dynamic import to avoid breaking if not configured)
        try {
          const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
          const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
          if (redisUrl && redisToken) {
            const { Redis } = await import("@upstash/redis")
            const redis = new Redis({ url: redisUrl, token: redisToken })
            const user = await redis.get<{
              id: string; name: string; email: string; passwordHash: string
            }>(`user:${credentials.email.toLowerCase()}`)
            if (user) {
              const valid = await bcrypt.compare(credentials.password, user.passwordHash)
              if (valid) {
                return { id: user.id, email: user.email, name: user.name }
              }
              return null // User found but wrong password
            }
          }
        } catch {
          // Redis not available, fall through
        }

        // Fallback: env var admin account
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHashB64 = process.env.ADMIN_PASSWORD_HASH_B64

        if (adminEmail && adminPasswordHashB64) {
          if (credentials.email.toLowerCase() === adminEmail.toLowerCase()) {
            const hash = Buffer.from(adminPasswordHashB64, "base64").toString("utf-8")
            const isValid = await bcrypt.compare(credentials.password, hash)
            if (isValid) {
              return { id: "admin", email: adminEmail, name: adminEmail.split("@")[0] }
            }
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
}
