import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updatePassword } from "@/lib/users"
import { getPasswordValidationError } from "@/lib/password-validation"

export const runtime = "nodejs"

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
}).strict()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updatePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data

    const passwordError = getPasswordValidationError(newPassword)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const success = await updatePassword(session.user.email, currentPassword, newPassword)
    if (!success) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    if (e instanceof Error && e.message === "ACCOUNT_LOCKED") {
      return NextResponse.json({ error: "Too many failed attempts. Please try again later." }, { status: 429 })
    }
    console.error("[update-password] Error:", e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
