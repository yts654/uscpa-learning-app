import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { lsApi, getStoreId, getVariantId } from "@/lib/lemonsqueezy"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const storeId = getStoreId()
  const variantId = getVariantId()

  if (!storeId || !variantId) {
    return NextResponse.json({ error: "Lemon Squeezy not configured" }, { status: 500 })
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://yts654-uscpa-learning-app-da1x.vercel.app"

  const data = await lsApi("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: session.user.email,
            name: session.user.name || undefined,
            custom: {
              user_email: session.user.email,
            },
          },
          product_options: {
            redirect_url: `${baseUrl}/home?upgraded=true`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  })

  const checkoutUrl = data?.data?.attributes?.url
  if (!checkoutUrl) {
    console.error("[lemonsqueezy] Checkout creation failed:", JSON.stringify(data))
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }

  return NextResponse.json({ url: checkoutUrl })
}
