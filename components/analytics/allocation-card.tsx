"use client"

import { useState } from "react"
import { type AllocationRecommendation } from "@/lib/analytics-engine"
import { SECTION_INFO } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { Lightbulb, ArrowUp, ArrowDown, Minus, HelpCircle, X } from "lucide-react"

interface AllocationCardProps {
  allocations: AllocationRecommendation[]
}

export function AllocationCard({ allocations }: AllocationCardProps) {
  const { t, locale } = useLanguage()
  const [showHelp, setShowHelp] = useState(false)

  const changeIcon = (change: AllocationRecommendation["change"]) => {
    if (change === "increase") return <ArrowUp className="w-3 h-3" style={{ color: "hsl(145, 45%, 35%)" }} />
    if (change === "decrease") return <ArrowDown className="w-3 h-3" style={{ color: "hsl(0, 65%, 45%)" }} />
    return <Minus className="w-3 h-3 text-muted-foreground" />
  }

  const changeColor = (change: AllocationRecommendation["change"]) => {
    if (change === "increase") return "hsl(145, 45%, 35%)"
    if (change === "decrease") return "hsl(0, 65%, 45%)"
    return "hsl(var(--muted-foreground))"
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.allocation.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("analytics.allocation.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {showHelp ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
        </button>
      </div>

      {showHelp && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border space-y-2">
          <p className="text-xs font-semibold text-card-foreground">
            {t("analytics.allocation.help.title")}
          </p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="font-semibold text-card-foreground">{t("analytics.allocation.help.current")}</span> — {t("analytics.allocation.help.currentDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.allocation.help.recommended")}</span> — {t("analytics.allocation.help.recommendedDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.allocation.help.change")}</span> — {t("analytics.allocation.help.changeDesc")}</p>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
            {t("analytics.allocation.help.footer")}
          </p>
        </div>
      )}

      <div className="space-y-0">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-5 gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>{t("analytics.allocation.section")}</div>
          <div className="text-center">{t("analytics.allocation.current")}</div>
          <div className="text-center">{t("analytics.allocation.recommended")}</div>
          <div className="text-center">{t("analytics.allocation.change")}</div>
          <div>{t("analytics.allocation.reason")}</div>
        </div>

        {allocations.map((alloc) => (
          <div key={alloc.section} className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-3 py-2.5 border-b border-border last:border-b-0 items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: SECTION_INFO[alloc.section].color }}
              >
                {alloc.section}
              </div>
              <span className="text-xs font-medium text-card-foreground">{alloc.section}</span>
            </div>
            <div className="text-center text-xs text-muted-foreground">{alloc.currentHoursPerWeek}h</div>
            <div className="text-center text-xs font-medium text-card-foreground">{alloc.recommendedHoursPerWeek}h</div>
            <div className="flex items-center justify-center gap-1">
              {changeIcon(alloc.change)}
              <span className="text-[10px] font-medium" style={{ color: changeColor(alloc.change) }}>
                {alloc.change === "increase" ? t("analytics.allocation.increase") : alloc.change === "decrease" ? t("analytics.allocation.decrease") : t("analytics.allocation.maintain")}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 text-xs text-muted-foreground truncate" title={alloc.reason}>
              {alloc.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
