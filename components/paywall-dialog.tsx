"use client"

import { useState } from "react"
import { X, Sparkles, Zap, BookOpen } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface PaywallDialogProps {
  open: boolean
  onClose: () => void
  reason: "limit_reached" | "ai_study_plan"
}

export function PaywallDialog({ open, onClose, reason }: PaywallDialogProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  if (!open) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-8 pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            {reason === "limit_reached" ? (
              <Zap className="w-6 h-6 text-primary" />
            ) : (
              <BookOpen className="w-6 h-6 text-primary" />
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground">
            {reason === "limit_reached" ? t("paywall.limitTitle") : t("paywall.planTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {reason === "limit_reached" ? t("paywall.limitDesc") : t("paywall.planDesc")}
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("paywall.benefit1Title")}</p>
              <p className="text-xs text-muted-foreground">{t("paywall.benefit1Desc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("paywall.benefit2Title")}</p>
              <p className="text-xs text-muted-foreground">{t("paywall.benefit2Desc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("paywall.benefit3Title")}</p>
              <p className="text-xs text-muted-foreground">{t("paywall.benefit3Desc")}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2">
          <button
            disabled
            className="w-full py-3 rounded-xl bg-primary/50 text-primary-foreground text-sm font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t("paywall.comingSoon")}
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            {t("paywall.comingSoonDesc")}
          </p>
        </div>
      </div>
    </div>
  )
}
