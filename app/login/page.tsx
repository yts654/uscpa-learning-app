"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("admin@cpamastery.com")
  const [password, setPassword] = useState("CpaMastery2026!")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [unverifiedEmail, setUnverifiedEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const verified = searchParams.get("verified")

  // Sign out any existing session in the background (non-blocking)
  useEffect(() => {
    signOut({ redirect: false }).catch(() => {})
  }, [])

  const handleResend = async () => {
    if (!unverifiedEmail) return
    setResending(true)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      })
      router.push(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`)
    } catch {
      // ignore
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setUnverifiedEmail("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      // Check if login failed due to unverified email
      try {
        const res = await fetch("/api/auth/check-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (data.verified === false) {
          setError("Your email is not verified. Please check your inbox or resend the verification email.")
          setUnverifiedEmail(email)
          setLoading(false)
          return
        }
      } catch {
        // ignore check error
      }
      setError("Invalid email or password")
      setLoading(false)
    } else {
      window.location.href = "/home"
    }
  }

  return (
    <>
      {/* Banners */}
      {verified === "success" && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 mb-4">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Email verified successfully! You can now sign in.
        </div>
      )}
      {verified === "invalid" && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
          <XCircle className="w-4 h-4 shrink-0" />
          Invalid or expired verification link.
        </div>
      )}

      {/* Login Card */}
      <div className="bg-[hsl(232,40%,12%)] border border-[hsl(232,35%,20%)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
        <p className="text-xs text-[hsl(230,15%,50%)] mb-6">Enter your credentials to access the platform</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[hsl(230,15%,65%)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cpamastery.com"
              required
              className="w-full px-3 py-2.5 rounded-lg bg-[hsl(232,40%,8%)] border border-[hsl(232,35%,22%)] text-white text-sm placeholder:text-[hsl(230,15%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(225,50%,40%)] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(230,15%,65%)] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[hsl(232,40%,8%)] border border-[hsl(232,35%,22%)] text-white text-sm placeholder:text-[hsl(230,15%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(225,50%,40%)] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(230,15%,45%)] hover:text-[hsl(230,15%,70%)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <p>{error}</p>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="mt-2 text-white underline hover:no-underline disabled:opacity-50"
                >
                  {resending ? "Resending..." : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-white text-[hsl(232,47%,8%)] text-sm font-bold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-xs text-[hsl(230,15%,50%)] text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-white hover:underline">Create one</Link>
        </p>
      </div>
    </>
  )
}

export default function LoginPage() {
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
          <LoginForm />
        </Suspense>

        <p className="text-[10px] text-[hsl(230,15%,30%)] text-center mt-6">&copy; 2026 CPA Mastery</p>
      </div>
    </div>
  )
}
