import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { verifyUser } from "./users"

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

        // 0. Fast path: demo credentials (already visible in client code)
        const DEMO_EMAIL = "admin@cpamastery.com"
        const DEMO_PASSWORD = "CpaMastery2026!"
        if (
          credentials.email.toLowerCase() === DEMO_EMAIL &&
          credentials.password === DEMO_PASSWORD
        ) {
          // Check if demo user exists in DB first
          const { getUserByEmail } = await import("./users")
          const dbUser = await getUserByEmail(DEMO_EMAIL)
          if (dbUser) {
            return { id: dbUser.id, email: dbUser.email, name: dbUser.name }
          }
          return { id: "admin", email: DEMO_EMAIL, name: "admin" }
        }

        // 1. Try file-based / Redis user database
        try {
          const user = await verifyUser(credentials.email, credentials.password)
          if (user) {
            return { id: user.id, email: user.email, name: user.name }
          }
        } catch (e) {
          console.error("[auth] verifyUser error:", e)
        }

        // 2. Fallback: env var admin account
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHashB64 = process.env.ADMIN_PASSWORD_HASH_B64

        if (adminEmail && adminPasswordHashB64) {
          if (credentials.email.toLowerCase() === adminEmail.toLowerCase()) {
            try {
              const hash = Buffer.from(adminPasswordHashB64, "base64").toString("utf-8")
              const isValid = await bcrypt.compare(credentials.password, hash)
              if (isValid) {
                return { id: "admin", email: adminEmail, name: adminEmail.split("@")[0] }
              }
            } catch (e) {
              console.error("[auth] admin bcrypt error:", e)
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
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // maxAge を省略 → ブラウザセッション限りのCookie（タブを閉じたら消える）
      },
    },
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
