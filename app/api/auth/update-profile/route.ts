import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateUserProfile } from "@/lib/users"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { name, email } = await req.json()

  const success = await updateUserProfile(session.user.email, { name, newEmail: email })
  if (!success) {
    return NextResponse.json({ error: "Update failed (email may already be in use)" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
