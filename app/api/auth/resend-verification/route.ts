import { NextResponse } from "next/server"
import { regenerateVerificationToken } from "@/lib/users"
import { sendVerificationEmail } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const token = await regenerateVerificationToken(email)

    if (!token) {
      // Don't reveal whether email exists or is already verified
      return NextResponse.json({ success: true })
    }

    await sendVerificationEmail(email, token)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[resend-verification] Error:", e)
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 })
  }
}
