import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { verifyUser } from "@/lib/users"

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

        // Try KV database first
        try {
          const user = await verifyUser(credentials.email, credentials.password)
          if (user) {
            return { id: user.id, email: user.email, name: user.name }
          }
        } catch {
          // KV not configured, fall through to env var admin
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
