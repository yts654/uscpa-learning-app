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
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const rememberMe = credentials.rememberMe === "true"

        // 0. Fast path: demo credentials (already visible in client code)
        const DEMO_EMAIL = "admin@cpamastery.com"
        const DEMO_PASSWORD = "CpaMastery2026!"
        if (
          credentials.email.toLowerCase() === DEMO_EMAIL &&
          credentials.password === DEMO_PASSWORD
        ) {
          return { id: "admin", email: DEMO_EMAIL, name: "admin", rememberMe }
        }

        // 1. Try in-memory user database
        try {
          const user = await verifyUser(credentials.email, credentials.password)
          if (user) {
            return { id: user.id, email: user.email, name: user.name, rememberMe }
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
                return { id: "admin", email: adminEmail, name: adminEmail.split("@")[0], rememberMe }
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
    maxAge: 30 * 24 * 60 * 60, // 30 days (max; middleware enforces shorter for non-rememberMe)
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.loginAt = Date.now()
        token.rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? false
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
