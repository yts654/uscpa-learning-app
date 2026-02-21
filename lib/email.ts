import sgMail from "@sendgrid/mail"

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function sendVerificationEmail(to: string, token: string) {
  if (!SENDGRID_API_KEY || !EMAIL_FROM) {
    console.warn("[email] SendGrid not configured, skipping email send")
    return
  }

  sgMail.setApiKey(SENDGRID_API_KEY)

  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`

  await sgMail.send({
    to,
    from: EMAIL_FROM,
    subject: "CPA Mastery - Verify Your Email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a2e; margin-bottom: 16px;">Welcome to CPA Mastery!</h2>
        <p style="color: #444; line-height: 1.6;">
          Thank you for creating an account. Please verify your email address by clicking the button below.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}"
             style="background: #1a1a2e; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.5;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #4a6cf7;">${verifyUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 11px;">CPA Mastery - USCPA Study Platform</p>
      </div>
    `,
  })
}
