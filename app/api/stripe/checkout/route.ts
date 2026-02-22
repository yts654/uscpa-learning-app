import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStripe, PRICE_ID } from "@/lib/stripe"
import { getUserByEmail, updateUserPlan } from "@/lib/users"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!PRICE_ID) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  const stripe = getStripe()
  const email = session.user.email
  const user = await getUserByEmail(email)

  // Reuse existing Stripe customer or create new one
  let customerId = user?.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: session.user.name || undefined,
      metadata: { app: "cpa-mastery" },
    })
    customerId = customer.id
    if (user) {
      await updateUserPlan(email, user.plan, customerId)
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://yts654-uscpa-learning-app-da1x.vercel.app"

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${baseUrl}/home?upgraded=true`,
    cancel_url: `${baseUrl}/pricing`,
    subscription_data: {
      metadata: { email },
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
