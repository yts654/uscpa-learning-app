import { NextResponse } from "next/server"
import { createUser } from "@/lib/users"
import { getPasswordValidationError } from "@/lib/password-validation"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
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
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[register] Error:", msg)
    return NextResponse.json({ error: `Registration failed: ${msg}` }, { status: 500 })
  }
}
