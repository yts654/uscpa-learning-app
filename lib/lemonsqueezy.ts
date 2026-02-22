const API_BASE = "https://api.lemonsqueezy.com/v1"

function getApiKey(): string {
  const key = process.env.LEMONSQUEEZY_API_KEY
  if (!key) throw new Error("Missing LEMONSQUEEZY_API_KEY")
  return key
}

export function getStoreId(): string {
  return process.env.LEMONSQUEEZY_STORE_ID || ""
}

export function getVariantId(): string {
  return process.env.LEMONSQUEEZY_VARIANT_ID || ""
}

export async function lsApi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      ...options.headers,
    },
  })
  return res.json()
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) return false

  const crypto = require("crypto")
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(body).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}
