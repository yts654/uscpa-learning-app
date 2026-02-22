import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getUserByStripeCustomerId, updateUserPlan } from "@/lib/users"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("[webhook] Missing STRIPE_WEBHOOK_SECRET")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log(`[webhook] Received event: ${event.type}`)

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === "subscription" && session.customer) {
        const customerId = typeof session.customer === "string" ? session.customer : session.customer.id
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id

        // Get email from session metadata or customer
        const email = session.metadata?.email || session.customer_email
        if (email) {
          await updateUserPlan(email, "pro", customerId, subscriptionId || undefined)
          console.log(`[webhook] Upgraded ${email} to pro`)
        } else {
          // Fallback: look up by customer ID
          const user = await getUserByStripeCustomerId(customerId)
          if (user) {
            await updateUserPlan(user.email, "pro", customerId, subscriptionId || undefined)
            console.log(`[webhook] Upgraded ${user.email} to pro (via customer lookup)`)
          }
        }
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
      const user = await getUserByStripeCustomerId(customerId)
      if (user) {
        const isActive = subscription.status === "active" || subscription.status === "trialing"
        await updateUserPlan(
          user.email,
          isActive ? "pro" : "free",
          customerId,
          subscription.id,
          isActive ? (subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : undefined) : undefined,
        )
        console.log(`[webhook] Subscription updated for ${user.email}: ${subscription.status}`)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
      const user = await getUserByStripeCustomerId(customerId)
      if (user) {
        await updateUserPlan(user.email, "free", customerId)
        console.log(`[webhook] Subscription deleted for ${user.email}, downgraded to free`)
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
      if (customerId) {
        const user = await getUserByStripeCustomerId(customerId)
        if (user) {
          await updateUserPlan(user.email, "free", customerId)
          console.log(`[webhook] Payment failed for ${user.email}, downgraded to free`)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
