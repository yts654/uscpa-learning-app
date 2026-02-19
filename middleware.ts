import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-dev-secret-change-in-production",
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login
     * - /api/auth (NextAuth routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icons, etc (static assets)
     */
    "/((?!login|api/auth|_next|favicon\\.ico|icons).*)",
  ],
}
