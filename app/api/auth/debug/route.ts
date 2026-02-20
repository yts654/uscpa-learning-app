import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL
  const hashB64 = process.env.ADMIN_PASSWORD_HASH_B64
  const secret = process.env.NEXTAUTH_SECRET

  let decodedHash = ""
  try {
    if (hashB64) {
      decodedHash = Buffer.from(hashB64, "base64").toString("utf-8")
    }
  } catch (e: unknown) {
    decodedHash = "DECODE_ERROR: " + (e instanceof Error ? e.message : String(e))
  }

  return NextResponse.json({
    ADMIN_EMAIL_SET: !!adminEmail,
    ADMIN_EMAIL_VALUE: adminEmail || "NOT SET",
    ADMIN_PASSWORD_HASH_B64_SET: !!hashB64,
    ADMIN_PASSWORD_HASH_B64_LENGTH: hashB64?.length || 0,
    DECODED_HASH_STARTS_WITH: decodedHash.substring(0, 10),
    DECODED_HASH_VALID: decodedHash.startsWith("$2b$") || decodedHash.startsWith("$2a$"),
    NEXTAUTH_SECRET_SET: !!secret,
  })
}
