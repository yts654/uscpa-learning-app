import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updatePassword } from "@/lib/users"
import { getPasswordValidationError } from "@/lib/password-validation"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both fields are required" }, { status: 400 })
  }
  const passwordError = getPasswordValidationError(newPassword)
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 })
  }

  const success = await updatePassword(session.user.email, currentPassword, newPassword)
  if (!success) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 })
  }

  return NextResponse.json({ success: true })
}
