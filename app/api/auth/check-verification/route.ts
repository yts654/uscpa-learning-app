import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/users"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({ verified: user.emailVerified })
  } catch (e) {
    console.error("[check-verification] Error:", e)
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
}
