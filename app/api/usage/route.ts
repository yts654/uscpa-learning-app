import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUsage } from "@/lib/usage"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const plan = session.user.plan || "free"

  try {
    const usage = await getUsage(session.user.email, plan as "free" | "pro")
    return NextResponse.json({ ...usage, plan })
  } catch {
    // Fallback if Redis is not configured
    return NextResponse.json({
      used: 0,
      limit: plan === "pro" ? 60 : 10,
      remaining: plan === "pro" ? 60 : 10,
      plan,
    })
  }
}
