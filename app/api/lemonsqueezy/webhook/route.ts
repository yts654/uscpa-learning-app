import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/lemonsqueezy"
import { updateUserPlan } from "@/lib/users"
import { getUserRepository } from "@/lib/infrastructure/redis"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("x-signature")

  if (!signature || !verifyWebhookSignature(body, signature)) {
    console.error("[ls-webhook] Invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let payload: any
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Idempotency check
  const eventId = String(payload?.meta?.webhook_id || payload?.data?.id || "")
  if (eventId) {
    const repo = getUserRepository()
    if (await repo.isEventProcessed(`ls_${eventId}`)) {
      console.log(`[ls-webhook] Skipping duplicate event: ${eventId}`)
      return NextResponse.json({ received: true })
    }
  }

  const eventName = payload?.meta?.event_name
  const attrs = payload?.data?.attributes
  const customData = payload?.meta?.custom_data
  const email = customData?.user_email || attrs?.user_email

  console.log(`[ls-webhook] Event: ${eventName}`)

  if (!email) {
    console.error("[ls-webhook] No email found in webhook payload")
    return NextResponse.json({ received: true })
  }

  const subscriptionId = String(payload?.data?.id || "")
  const customerId = String(attrs?.customer_id || "")

  switch (eventName) {
    case "subscription_created":
    case "subscription_resumed":
    case "subscription_unpaused": {
      await updateUserPlan(email, "pro", customerId, subscriptionId)
      console.log("[ls-webhook] User upgraded to pro")
      break
    }

    case "subscription_updated": {
      const status = attrs?.status
      const isActive = status === "active" || status === "on_trial"
      await updateUserPlan(email, isActive ? "pro" : "free", customerId, subscriptionId)
      console.log(`[ls-webhook] Subscription updated: ${status}`)
      break
    }

    case "subscription_cancelled":
    case "subscription_expired": {
      await updateUserPlan(email, "free", customerId, subscriptionId)
      console.log("[ls-webhook] User downgraded to free")
      break
    }

    case "subscription_payment_failed": {
      await updateUserPlan(email, "free", customerId, subscriptionId)
      console.log("[ls-webhook] Payment failed, downgraded to free")
      break
    }

    case "subscription_payment_success": {
      await updateUserPlan(email, "pro", customerId, subscriptionId)
      console.log("[ls-webhook] Payment success, upgraded to pro")
      break
    }
  }

  // Mark event as processed
  if (eventId) {
    const repo = getUserRepository()
    await repo.markEventProcessed(`ls_${eventId}`)
  }

  return NextResponse.json({ received: true })
}
