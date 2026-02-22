"use client"

import { useState } from "react"
import { type RiskItem, type RiskLevel } from "@/lib/analytics-engine"
import { useLanguage } from "@/lib/i18n"
import { AlertTriangle, AlertCircle, Info, ShieldCheck, HelpCircle, X } from "lucide-react"

interface RiskRadarCardProps {
  risks: RiskItem[]
}

const LEVEL_CONFIG: Record<RiskLevel, { icon: typeof AlertTriangle; color: string; bgClass: string; borderClass: string }> = {
  critical: {
    icon: AlertTriangle,
    color: "hsl(0, 65%, 45%)",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    borderClass: "border-red-200 dark:border-red-900/50",
  },
  warning: {
    icon: AlertCircle,
    color: "hsl(25, 55%, 40%)",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    borderClass: "border-orange-200 dark:border-orange-900/50",
  },
  info: {
    icon: Info,
    color: "hsl(225, 50%, 45%)",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-900/50",
  },
}

export function RiskRadarCard({ risks }: RiskRadarCardProps) {
  const { t, locale } = useLanguage()
  const [showHelp, setShowHelp] = useState(false)

  const helpItems = [
    { icon: AlertTriangle, color: "hsl(0, 65%, 45%)", label: t("analytics.risk.help.reviewDebt"), desc: t("analytics.risk.help.reviewDebtDesc") },
    { icon: AlertCircle, color: "hsl(25, 55%, 40%)", label: t("analytics.risk.help.cramming"), desc: t("analytics.risk.help.crammingDesc") },
    { icon: Info, color: "hsl(225, 50%, 45%)", label: t("analytics.risk.help.stagnation"), desc: t("analytics.risk.help.stagnationDesc") },
    { icon: AlertCircle, color: "hsl(25, 55%, 40%)", label: t("analytics.risk.help.untouched"), desc: t("analytics.risk.help.untouchedDesc") },
    { icon: Info, color: "hsl(225, 50%, 45%)", label: t("analytics.risk.help.variance"), desc: t("analytics.risk.help.varianceDesc") },
  ]

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.risk.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("analytics.risk.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title={t("analytics.risk.help.title")}
        >
          {showHelp ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
        </button>
      </div>

      {showHelp && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <p className="text-xs font-semibold text-card-foreground">
            {t("analytics.risk.help.title")}
          </p>
          {helpItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: item.color }} />
                <div>
                  <span className="text-xs font-semibold text-card-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            )
          })}
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
            {t("analytics.risk.help.footer")}
          </p>
        </div>
      )}

      {risks.length === 0 ? (
        <div className="flex items-center gap-3 py-8 justify-center">
          <ShieldCheck className="w-5 h-5 text-[hsl(145,45%,35%)]" />
          <span className="text-sm text-muted-foreground">{t("analytics.risk.noRisks")}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {risks.map((risk) => {
            const config = LEVEL_CONFIG[risk.level]
            const Icon = config.icon
            return (
              <div
                key={risk.id}
                className={`rounded-lg p-3 border ${config.bgClass} ${config.borderClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
                        {t(`analytics.risk.${risk.level}` as "analytics.risk.critical")}
                      </span>
                      <span className="text-xs font-medium text-foreground">{risk.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{risk.description}</p>
                    <p className="text-xs font-medium mt-1.5" style={{ color: config.color }}>{risk.prescription}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
