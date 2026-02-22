"use client"

import { useState } from "react"
import { Check, X, Sparkles, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/lib/i18n"

export default function PricingPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(false)
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: t("pricing.perMonth"),
      description: t("pricing.freeDesc"),
      features: [
        { text: t("pricing.freeFeature1"), included: true },
        { text: t("pricing.freeFeature2"), included: true },
        { text: t("pricing.freeFeature3"), included: true },
        { text: t("pricing.freeFeature4"), included: false },
        { text: t("pricing.freeFeature5"), included: false },
      ],
      cta: t("pricing.freeCta"),
      highlighted: false,
    },
    {
      name: "Pro",
      price: "¥980",
      period: t("pricing.perMonth"),
      description: t("pricing.proDesc"),
      features: [
        { text: t("pricing.proFeature1"), included: true },
        { text: t("pricing.proFeature2"), included: true },
        { text: t("pricing.proFeature3"), included: true },
        { text: t("pricing.proFeature4"), included: true },
        { text: t("pricing.proFeature5"), included: true },
      ],
      cta: t("pricing.proCta"),
      highlighted: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-background" />
            </div>
            <span className="font-serif text-lg font-bold">CPA Mastery</span>
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                {t("pricing.backToApp")}
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                {t("pricing.login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
          {t("pricing.heroTitle")}
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          {t("pricing.heroSubtitle")}
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-primary/[0.02] ring-1 ring-primary/20 shadow-lg relative"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                  {t("pricing.popular")}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.highlighted ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-primary/50 text-primary-foreground text-sm font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("pricing.comingSoon")}
                </button>
              ) : (
                <Link
                  href={session ? "/home" : "/register"}
                  className="w-full py-3 rounded-xl border border-border text-foreground text-sm font-bold hover:bg-muted/50 transition-all flex items-center justify-center"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ / Cancel note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t("pricing.cancelAnytime")}
          </p>
        </div>
      </div>
    </div>
  )
}
