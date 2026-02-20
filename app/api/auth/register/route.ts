import { NextResponse } from "next/server"
import { createUser } from "@/lib/users"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    await createUser(name, email, password)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "USER_EXISTS") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    console.error("[register] Error:", e)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
