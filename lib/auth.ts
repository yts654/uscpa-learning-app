import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { verifyUser, getUserByEmail } from "./users"
import { env } from "./config"

export const authOptions: NextAuthOptions = {
  secret: env().NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rememberMe = credentials.rememberMe === "true"

        // 1. Try user database (Redis)
        try {
          const user = await verifyUser(credentials.email, credentials.password)
          if (user) {
            return { id: user.id, email: user.email, name: user.name, rememberMe, plan: user.plan }
          }
        } catch (e) {
          if (e instanceof Error && e.message === "ACCOUNT_LOCKED") {
            console.error("[auth] Account locked:", credentials.email)
          } else {
            console.error("[auth] verifyUser error:", e)
          }
          return null
        }

        // 2. Env-based admin account (bcrypt hash in base64)
        const config = env()
        if (config.ADMIN_EMAIL && config.ADMIN_PASSWORD_HASH_B64) {
          if (credentials.email.toLowerCase() === config.ADMIN_EMAIL.toLowerCase()) {
            try {
              const hash = Buffer.from(config.ADMIN_PASSWORD_HASH_B64, "base64").toString("utf-8")
              const isValid = await bcrypt.compare(credentials.password, hash)
              if (isValid) {
                return {
                  id: "admin",
                  email: config.ADMIN_EMAIL,
                  name: config.ADMIN_EMAIL.split("@")[0],
                  rememberMe,
                  plan: "free" as const,
                }
              }
            } catch (e) {
              console.error("[auth] admin bcrypt error:", e)
            }
          }
        }

        // 3. Env-based demo account (optional, bcrypt hash in base64)
        if (config.DEMO_EMAIL && config.DEMO_PASSWORD_HASH_B64) {
          if (credentials.email.toLowerCase() === config.DEMO_EMAIL.toLowerCase()) {
            try {
              const hash = Buffer.from(config.DEMO_PASSWORD_HASH_B64, "base64").toString("utf-8")
              const isValid = await bcrypt.compare(credentials.password, hash)
              if (isValid) {
                return {
                  id: "demo",
                  email: config.DEMO_EMAIL,
                  name: "Demo User",
                  rememberMe,
                  plan: "free" as const,
                }
              }
            } catch (e) {
              console.error("[auth] demo bcrypt error:", e)
            }
          }
        }

        // All paths failed — return generic null (no info leak)
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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!
        token.loginAt = Date.now()
        token.rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? false
        token.plan = (user as { plan?: "free" | "pro" }).plan ?? "free"
      }
      if (trigger !== "signIn" && token.email) {
        const lastRefresh = (token as { planRefreshedAt?: number }).planRefreshedAt || 0
        if (Date.now() - lastRefresh > 5 * 60 * 1000) {
          try {
            const dbUser = await getUserByEmail(token.email)
            if (dbUser) {
              token.plan = dbUser.plan
            }
          } catch {
            // Keep existing plan on error
          }
          ;(token as { planRefreshedAt?: number }).planRefreshedAt = Date.now()
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.plan = (token.plan as "free" | "pro") || "free"
      }
      return session
    },
  },
}
