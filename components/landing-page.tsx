"use client"

import Link from "next/link"
import { BookOpen, Sparkles, BarChart3, RefreshCw, Brain, ArrowRight, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function LandingPage() {
  const { t } = useLanguage()

  const features = [
    { icon: Sparkles, titleKey: "lp.feature1Title" as const, descKey: "lp.feature1Desc" as const },
    { icon: BarChart3, titleKey: "lp.feature2Title" as const, descKey: "lp.feature2Desc" as const },
    { icon: RefreshCw, titleKey: "lp.feature3Title" as const, descKey: "lp.feature3Desc" as const },
    { icon: Brain, titleKey: "lp.feature4Title" as const, descKey: "lp.feature4Desc" as const },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-background" />
            </div>
            <span className="font-serif text-lg font-bold">CPA Mastery</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("lp.features")}</a>
            <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("lp.login")}</Link>
            <Link href="/home" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {t("lp.signUp")}
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-3">
            <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground">{t("lp.login")}</Link>
            <Link href="/home" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">{t("lp.signUp")}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {t("lp.badge")}
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
          {t("lp.heroTitle")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
          {t("lp.heroSubtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/home"
            className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            {t("lp.getStarted")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-4">
            {t("lp.featuresTitle")}
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            {t("lp.featuresSubtitle")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="bg-card rounded-xl border border-border p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{t(f.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof / Quick benefits */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
          {t("lp.whyTitle")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {(["lp.why1", "lp.why2", "lp.why3"] as const).map((key) => (
            <div key={key} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground text-left">{t(key)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">{t("lp.ctaTitle")}</h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">{t("lp.ctaSubtitle")}</p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-background text-foreground font-bold text-sm hover:bg-background/90 transition-all"
          >
            {t("lp.ctaButton")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">&copy; 2026 CPA Mastery</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/legal/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("lp.terms")}
            </Link>
            <Link href="/legal/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t("lp.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
