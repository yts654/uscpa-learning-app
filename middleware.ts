import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

const DAY_MS = 24 * 60 * 60 * 1000
const SHORT_SESSION_MS = 1 * DAY_MS       // 24 hours for non-rememberMe
const LONG_SESSION_MS = 30 * DAY_MS       // 30 days for rememberMe

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/lemonsqueezy/webhook") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next()
  }

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error("[middleware] NEXTAUTH_SECRET is not set")
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  const token = await getToken({ req: request, secret })

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check session expiry based on rememberMe flag
  const loginAt = (token.loginAt as number) || 0
  const rememberMe = (token.rememberMe as boolean) || false
  const maxAge = rememberMe ? LONG_SESSION_MS : SHORT_SESSION_MS

  if (loginAt && Date.now() - loginAt > maxAge) {
    const loginUrl = new URL("/login", request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
}
