"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

const REMEMBERED_EMAIL_KEY = "cpa_remembered_email"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Restore remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (saved) {
      setEmail(saved)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      // Save or clear remembered email
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      window.location.href = "/home"
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

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

        {/* Login Card */}
        <div className="bg-[hsl(232,40%,12%)] border border-[hsl(232,35%,20%)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
          <p className="text-xs text-[hsl(230,15%,50%)] mb-6">Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(230,15%,65%)] mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 rounded-lg bg-[hsl(232,40%,8%)] border border-[hsl(232,35%,22%)] text-white text-sm placeholder:text-[hsl(230,15%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(225,50%,40%)] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(230,15%,65%)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
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

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[hsl(232,35%,22%)] bg-[hsl(232,40%,8%)] text-[hsl(225,50%,50%)] focus:ring-[hsl(225,50%,40%)] focus:ring-offset-0"
              />
              <span className="text-xs text-[hsl(230,15%,55%)]">Remember me</span>
            </label>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
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

          <div className="mt-5 pt-4 border-t border-[hsl(232,35%,20%)] text-center">
            <p className="text-xs text-[hsl(230,15%,50%)] mb-3">
              Don&apos;t have an account?
            </p>
            <Link href="/register" className="block w-full py-2.5 rounded-lg border border-[hsl(232,35%,22%)] text-white text-sm font-medium hover:bg-[hsl(232,40%,16%)] transition-all text-center">
              Create Free Account
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-[hsl(230,15%,30%)] text-center mt-6">&copy; 2026 CPA Mastery</p>
      </div>
    </div>
  )
}
