import { NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/users"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    const url = new URL("/login?verified=invalid", req.url)
    return NextResponse.redirect(url)
  }

  const user = await verifyEmailToken(token)

  if (!user) {
    const url = new URL("/login?verified=invalid", req.url)
    return NextResponse.redirect(url)
  }

  const url = new URL("/login?verified=success", req.url)
  return NextResponse.redirect(url)
}
