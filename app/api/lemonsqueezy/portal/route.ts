import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserByEmail } from "@/lib/users"
import { lsApi } from "@/lib/lemonsqueezy"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getUserByEmail(session.user.email)
  if (!user?.stripeSubscriptionId) {
    // stripeSubscriptionId is reused to store the LS subscription ID
    return NextResponse.json({ error: "No subscription found" }, { status: 400 })
  }

  const data = await lsApi(`/subscriptions/${user.stripeSubscriptionId}`)
  const portalUrl = data?.data?.attributes?.urls?.customer_portal

  if (!portalUrl) {
    return NextResponse.json({ error: "Could not get portal URL" }, { status: 500 })
  }

  return NextResponse.json({ url: portalUrl })
}
