"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { BookOpen, Mail, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState("")

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setError("")
    setResent(false)

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        setError("Failed to resend. Please try again.")
      } else {
        setResent(true)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-[hsl(232,40%,12%)] border border-[hsl(232,35%,20%)] rounded-2xl p-6 shadow-xl text-center">
      <div className="w-12 h-12 rounded-full bg-[hsl(225,50%,20%)] flex items-center justify-center mx-auto mb-4">
        <Mail className="w-6 h-6 text-[hsl(225,70%,60%)]" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Check Your Email</h2>
      <p className="text-sm text-[hsl(230,15%,55%)] mb-1">
        We sent a verification link to
      </p>
      {email && (
        <p className="text-sm text-white font-medium mb-4">{email}</p>
      )}
      <p className="text-xs text-[hsl(230,15%,45%)] mb-6">
        Click the link in your email to verify your account, then sign in.
      </p>

      {resent && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 mb-4 justify-center">
          <CheckCircle className="w-3.5 h-3.5" />
          Verification email resent!
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={resending || !email}
        className="w-full py-2.5 rounded-lg bg-[hsl(232,40%,18%)] border border-[hsl(232,35%,25%)] text-white text-sm font-medium hover:bg-[hsl(232,40%,22%)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-3"
      >
        {resending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Resending...
          </>
        ) : (
          "Resend Verification Email"
        )}
      </button>

      <Link
        href="/login"
        className="block w-full py-2.5 rounded-lg bg-white text-[hsl(232,47%,8%)] text-sm font-bold hover:bg-white/90 transition-all text-center"
      >
        Go to Sign In
      </Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(232,47%,6%)] via-[hsl(232,47%,10%)] to-[hsl(225,50%,14%)] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-[hsl(232,47%,8%)]" />
          </div>
          <h1 className="font-serif text-2xl text-white">CPA Mastery</h1>
          <p className="text-sm text-[hsl(230,15%,50%)] mt-1">USCPA Study Platform</p>
        </div>

        <Suspense fallback={null}>
          <VerifyEmailContent />
        </Suspense>

        <p className="text-[10px] text-[hsl(230,15%,30%)] text-center mt-6">&copy; 2026 CPA Mastery</p>
      </div>
    </div>
  )
}
