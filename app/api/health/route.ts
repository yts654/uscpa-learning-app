import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || "(not set)",
      vercelUrl: process.env.VERCEL_URL || "(not set)",
      hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
  })
}
