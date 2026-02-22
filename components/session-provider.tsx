"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

// Staging: provide a mock session so the app works without login
const mockSession: Session = {
  user: {
    id: "demo-user",
    name: "Demo User",
    email: "demo@cpamastery.com",
    plan: "pro",
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider session={mockSession}>
      {children}
    </NextAuthSessionProvider>
  )
}
