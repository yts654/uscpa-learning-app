import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateUserProfile } from "@/lib/users"

export const runtime = "nodejs"

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z0-9\s\u3000-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FA1F}]+$/u, "Name contains invalid characters")
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(254, "Email is too long")
    .transform((v) => v.toLowerCase())
    .optional(),
}).strict()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { name, email } = parsed.data

    const success = await updateUserProfile(session.user.email, { name, newEmail: email })
    if (!success) {
      return NextResponse.json({ error: "Update failed. The email may already be in use." }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[update-profile] Error:", e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
