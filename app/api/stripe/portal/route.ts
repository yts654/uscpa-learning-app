import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStripe } from "@/lib/stripe"
import { getUserByEmail } from "@/lib/users"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getUserByEmail(session.user.email)
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 })
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXTAUTH_URL || "https://yts654-uscpa-learning-app-da1x.vercel.app"

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/home`,
  })

  return NextResponse.json({ url: portalSession.url })
}
