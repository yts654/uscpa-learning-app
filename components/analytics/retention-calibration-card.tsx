"use client"

import { useState } from "react"
import { type CalibrationEntry } from "@/lib/analytics-engine"
import { SECTION_INFO } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { Brain, HelpCircle, X } from "lucide-react"

interface RetentionCalibrationCardProps {
  entries: CalibrationEntry[]
}

export function RetentionCalibrationCard({ entries }: RetentionCalibrationCardProps) {
  const { t, locale } = useLanguage()
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.retention.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("analytics.retention.subtitle")}</p>
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
            {t("analytics.retention.help.title")}
          </p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="font-semibold text-card-foreground">{t("analytics.retention.help.predicted")}</span> — {t("analytics.retention.help.predictedDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.retention.help.actual")}</span> — {t("analytics.retention.help.actualDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.retention.help.gap")}</span> — {t("analytics.retention.help.gapDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.retention.help.action")}</span> — {t("analytics.retention.help.actionDesc")}</p>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
            {t("analytics.retention.help.footer")}
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          {t("analytics.retention.noData")}
        </div>
      ) : (
        <div className="space-y-0">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-6 gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="col-span-2">{t("analytics.retention.chapter")}</div>
            <div className="text-center">{t("analytics.retention.predicted")}</div>
            <div className="text-center">{t("analytics.retention.actual")}</div>
            <div className="text-center">{t("analytics.retention.gap")}</div>
            <div className="text-center">{t("analytics.retention.action")}</div>
          </div>

          {entries.slice(0, 10).map((entry) => {
            const actionColor = entry.action === "shorten"
              ? "hsl(0, 65%, 45%)"
              : entry.action === "extend"
                ? "hsl(145, 45%, 35%)"
                : "hsl(175, 45%, 32%)"
            const actionLabel = entry.action === "shorten"
              ? t("analytics.retention.shortenInterval")
              : entry.action === "extend"
                ? t("analytics.retention.extendInterval")
                : t("analytics.retention.onTrack")

            return (
              <div key={entry.chapterId} className="grid grid-cols-2 sm:grid-cols-6 gap-2 px-3 py-2.5 border-b border-border last:border-b-0 items-center">
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: SECTION_INFO[entry.section].color }}
                  >
                    {entry.section.charAt(0)}
                  </div>
                  <span className="text-xs text-card-foreground truncate">
                    Ch.{entry.chapterNumber} {entry.chapterTitle}
                  </span>
                </div>
                <div className="text-center text-xs text-muted-foreground">{entry.predictedRetention}%</div>
                <div className="text-center text-xs text-card-foreground font-medium">{entry.actualRetention}%</div>
                <div className="text-center text-xs font-medium" style={{ color: entry.gap > 0 ? "hsl(145, 45%, 35%)" : entry.gap < 0 ? "hsl(0, 65%, 45%)" : "hsl(175, 45%, 32%)" }}>
                  {entry.gap > 0 ? "+" : ""}{entry.gap}%
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: actionColor, backgroundColor: actionColor + "18" }}>
                    {actionLabel}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
