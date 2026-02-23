import { NextResponse } from "next/server"
import { z } from "zod"
import { createUser } from "@/lib/users"
import { getPasswordValidationError } from "@/lib/password-validation"

export const runtime = "nodejs"

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z0-9\s\u3000-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FA1F}]+$/u, "Name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email format")
    .max(254, "Email is too long")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
}).strict()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const passwordError = getPasswordValidationError(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    await createUser(name, email, password)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "USER_EXISTS") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    console.error("[register] Error:", e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
