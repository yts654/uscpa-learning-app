"use client"

import { useState } from "react"
import { SECTION_INFO, type ExamSection } from "@/lib/study-data"
import { type PaceResult } from "@/lib/analytics-engine"
import { useLanguage } from "@/lib/i18n"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { Target, HelpCircle, X } from "lucide-react"

interface PaceEngineCardProps {
  paces: PaceResult[]
}

export function PaceEngineCard({ paces }: PaceEngineCardProps) {
  const { t, locale } = useLanguage()
  const [showHelp, setShowHelp] = useState(false)
  const hasGoals = paces.some(p => p.status !== "no-goal")

  if (!hasGoals) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.pace.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("analytics.pace.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          {t("analytics.pace.noGoal")}
        </div>
      </div>
    )
  }

  const chartData = paces.filter(p => p.status !== "no-goal").map(p => ({
    section: p.section,
    required: Math.round(p.weeklyRequiredHours * 10) / 10,
    actual: Math.round(p.weeklyActualHours * 10) / 10,
    fill: SECTION_INFO[p.section].color,
  }))

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.pace.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("analytics.pace.subtitle")}</p>
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
            {t("analytics.pace.help.title")}
          </p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="font-semibold text-card-foreground">{t("analytics.pace.help.barChart")}</span> — {t("analytics.pace.help.barChartDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.pace.help.remainingChapters")}</span> — {t("analytics.pace.help.remainingChaptersDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.pace.help.status")}</span> — {t("analytics.pace.help.statusDesc")}</p>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
            {t("analytics.pace.help.footer")}
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="h" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
              labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Bar dataKey="required" name={t("analytics.pace.weeklyRequired")} radius={[3, 3, 0, 0]} opacity={0.35}>
              {chartData.map(d => (
                <Cell key={d.section} fill={d.fill} />
              ))}
            </Bar>
            <Bar dataKey="actual" name={t("analytics.pace.weeklyActual")} radius={[3, 3, 0, 0]}>
              {chartData.map(d => (
                <Cell key={d.section} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section detail rows */}
      <div className="space-y-2">
        {paces.filter(p => p.status !== "no-goal").map(p => {
          const statusColor = p.status === "ahead" ? "hsl(145, 45%, 35%)" : p.status === "behind" ? "hsl(0, 65%, 45%)" : "hsl(175, 45%, 32%)"
          const statusLabel = p.status === "ahead" ? t("analytics.pace.ahead") : p.status === "behind" ? t("analytics.pace.behind") : t("analytics.pace.onTrack")
          return (
            <div key={p.section} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: SECTION_INFO[p.section].color }}
              >
                {p.section}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-card-foreground font-medium">
                    {p.remainingChapters} {t("analytics.pace.chapters")} {t("analytics.pace.remaining")}
                  </span>
                  <span className="text-muted-foreground">
                    {p.estimatedRemainingHours.toFixed(0)}h {t("analytics.pace.estimatedHours")}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{p.weeklyActualHours.toFixed(1)} / {p.weeklyRequiredHours.toFixed(1)} {t("analytics.pace.hPerWeek")}</span>
                  {p.weeksLeft > 0 && <span>{p.weeksLeft} {t("analytics.pace.weeksLeft")}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-medium" style={{ color: statusColor }}>
                  {statusLabel}
                </span>
                {p.status === "behind" && p.delayDays < 999 && (
                  <p className="text-[10px] text-muted-foreground">+{p.delayDays}{t("analytics.pace.days")}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
