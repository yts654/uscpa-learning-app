"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { validatePassword } from "@/lib/password-validation"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { score } = validatePassword(password)
    if (score < 100) {
      setError("Please meet all password requirements")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        window.location.href = "/login"
        return
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

        {/* Register Card */}
        <div className="bg-[hsl(232,40%,12%)] border border-[hsl(232,35%,20%)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-1">Create Account</h2>
          <p className="text-xs text-[hsl(230,15%,50%)] mb-6">Enter your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(230,15%,65%)] mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-3 py-2.5 rounded-lg bg-[hsl(232,40%,8%)] border border-[hsl(232,35%,22%)] text-white text-sm placeholder:text-[hsl(230,15%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(225,50%,40%)] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(230,15%,65%)] mb-1.5">Email</label>
              <input
                type="email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
              <PasswordStrengthIndicator password={password} />
            </div>

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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-xs text-[hsl(230,15%,50%)] text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-[10px] text-[hsl(230,15%,30%)] text-center mt-6">&copy; 2026 CPA Mastery</p>
      </div>
    </div>
  )
}
