"use client"

import { useState, useMemo, useCallback } from "react"
import { Filter, Brain, AlertTriangle, Clock, CalendarCheck, Shield, BookOpen, ChevronRight, Bell, Info, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { SECTION_INFO, type ExamSection, type Chapter, type RecallRating } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { useTheme } from "next-themes"
import {
  type ChapterRetention,
  getMasteryLevelInfo,
  getRetentionColor,
  calculateStability,
  calculateRetention,
} from "@/lib/spaced-repetition"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts"

type View = "dashboard" | "chapters" | "study-log" | "analytics" | "settings" | "review"

interface ReviewViewProps {
  chapterRetentions: ChapterRetention[]
  chapters: Chapter[]
  onSelectChapter: (chapter: Chapter) => void
  onViewChange: (view: View) => void
  onRecallRating?: (chapterId: string, rating: RecallRating) => void
}

interface UrgencyGroup {
  id: string
  label: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  items: ChapterRetention[]
}

const RECALL_COLORS: Record<RecallRating, string> = {
  0: "hsl(0, 65%, 45%)",
  1: "hsl(25, 55%, 40%)",
  2: "hsl(225, 50%, 45%)",
  3: "hsl(145, 45%, 35%)",
}
const RECALL_BG_COLORS: Record<RecallRating, string> = {
  0: "hsl(0, 65%, 95%)",
  1: "hsl(25, 55%, 95%)",
  2: "hsl(225, 50%, 95%)",
  3: "hsl(145, 45%, 95%)",
}

// Brighten an HSL color for dark mode by increasing lightness
function brightenForDark(hslColor: string, isDark: boolean): string {
  if (!isDark) return hslColor
  // Match both "hsl(225, 50%, 22%)" and "hsl(225 50% 22%)" formats
  const match = hslColor.match(/hsl\((\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?\)/)
  if (!match) return hslColor
  const [, h, s, l] = match
  const newL = Math.min(75, parseInt(l) + 35)
  return `hsl(${h}, ${s}%, ${newL}%)`
}

export function ReviewView({ chapterRetentions, chapters, onSelectChapter, onViewChange, onRecallRating }: ReviewViewProps) {
  const { t } = useLanguage()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [selectedSection, setSelectedSection] = useState<ExamSection | "ALL">("ALL")
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [criteriaOpen, setCriteriaOpen] = useState(false)
  const [ratedChapters, setRatedChapters] = useState<Record<string, RecallRating>>({})

  const filtered = useMemo(() => {
    if (selectedSection === "ALL") return chapterRetentions
    return chapterRetentions.filter((r) => r.section === selectedSection)
  }, [chapterRetentions, selectedSection])

  // Summary stats
  const studied = filtered.filter((r) => r.reviewCount > 0)
  const overdue = filtered.filter((r) => r.isOverdue)
  const avgRetention = studied.length > 0
    ? Math.round(studied.reduce((a, b) => a + b.retention, 0) / studied.length)
    : 0
  const mastered = filtered.filter((r) => r.masteryLevel === "mastered")

  // Urgency groups
  const groups: UrgencyGroup[] = useMemo(() => {
    const overdueItems = filtered.filter((r) => r.reviewCount > 0 && r.isOverdue)
    const dueTodayItems = filtered.filter((r) => r.reviewCount > 0 && r.isDueToday && !r.isOverdue)
    const comingUpItems = filtered.filter((r) => r.reviewCount > 0 && r.isComingUp && !r.isDueToday && !r.isOverdue)
    const wellRetained = filtered.filter((r) => r.reviewCount > 0 && r.retention >= 70 && !r.isDueToday && !r.isOverdue && !r.isComingUp)
    const notStudied = filtered.filter((r) => r.reviewCount === 0)

    return [
      {
        id: "overdue",
        label: t("review.group.overdue.label"),
        description: t("review.group.overdue.desc"),
        icon: AlertTriangle,
        color: "hsl(0, 65%, 45%)",
        bgColor: "hsl(0, 65%, 97%)",
        borderColor: "hsl(0, 65%, 88%)",
        items: overdueItems.sort((a, b) => a.retention - b.retention),
      },
      {
        id: "due-today",
        label: t("review.group.dueToday.label"),
        description: t("review.group.dueToday.desc"),
        icon: Clock,
        color: "hsl(25, 55%, 40%)",
        bgColor: "hsl(25, 55%, 97%)",
        borderColor: "hsl(25, 55%, 88%)",
        items: dueTodayItems.sort((a, b) => a.retention - b.retention),
      },
      {
        id: "coming-up",
        label: t("review.group.comingUp.label"),
        description: t("review.group.comingUp.desc"),
        icon: CalendarCheck,
        color: "hsl(225, 50%, 35%)",
        bgColor: "hsl(225, 50%, 97%)",
        borderColor: "hsl(225, 50%, 88%)",
        items: comingUpItems.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)),
      },
      {
        id: "well-retained",
        label: t("review.group.wellRetained.label"),
        description: t("review.group.wellRetained.desc"),
        icon: Shield,
        color: "hsl(145, 45%, 30%)",
        bgColor: "hsl(145, 45%, 97%)",
        borderColor: "hsl(145, 45%, 88%)",
        items: wellRetained.sort((a, b) => b.retention - a.retention),
      },
      {
        id: "not-studied",
        label: t("review.group.notStudied.label"),
        description: t("review.group.notStudied.desc"),
        icon: BookOpen,
        color: "hsl(230, 15%, 50%)",
        bgColor: "hsl(230, 15%, 97%)",
        borderColor: "hsl(230, 15%, 88%)",
        items: notStudied,
      },
    ]
  }, [filtered, t])

  const handleChapterClick = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId)
    if (ch) {
      onViewChange("chapters")
      // Small delay so view switches first
      setTimeout(() => onSelectChapter(ch), 0)
    }
  }

  const summaryItems = [
    { label: t("review.summary.studied"), value: studied.length.toString(), color: "hsl(225, 50%, 22%)" },
    { label: t("review.summary.overdue"), value: overdue.length.toString(), color: "hsl(0, 65%, 45%)" },
    { label: t("review.summary.avgRetention"), value: `${avgRetention}%`, color: "hsl(175, 45%, 28%)" },
    { label: t("review.summary.mastered"), value: mastered.length.toString(), color: "hsl(145, 45%, 30%)" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground text-balance">{t("review.title")}</h2>
        <p className="text-muted-foreground mt-1">
          {t("review.header.desc")}
        </p>
      </div>

      {/* Summary Strip */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {summaryItems.map((item) => (
            <div key={item.label} className="p-4 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
              <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Info */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setCriteriaOpen(!criteriaOpen)}
              className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-muted/20 transition-colors"
            >
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-card-foreground flex-1">{t("review.criteria.title")}</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", criteriaOpen && "rotate-180")} />
            </button>
            {criteriaOpen && (
              <div className="px-5 pb-5 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Review Intervals */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{t("review.criteria.intervals.title")}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{t("review.criteria.intervals.desc")}</p>
                    <div className="space-y-1.5">
                      {[
                        { review: t("review.criteria.intervals.1st"), interval: t("review.criteria.intervals.1d"), bar: 3 },
                        { review: t("review.criteria.intervals.2nd"), interval: t("review.criteria.intervals.3d"), bar: 10 },
                        { review: t("review.criteria.intervals.3rd"), interval: t("review.criteria.intervals.7d"), bar: 23 },
                        { review: t("review.criteria.intervals.4th"), interval: t("review.criteria.intervals.14d"), bar: 47 },
                        { review: t("review.criteria.intervals.5th"), interval: t("review.criteria.intervals.30d"), bar: 100 },
                      ].map((item) => (
                        <div key={item.review} className="flex items-center gap-2">
                          <span className="text-xs text-card-foreground w-14 flex-shrink-0">{item.review}</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[hsl(225,50%,22%)]" style={{ width: `${item.bar}%` }} />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-14 text-right">{item.interval}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alert Criteria */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{t("review.criteria.alerts.title")}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{t("review.criteria.alerts.desc")}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "hsl(0, 65%, 97%)" }}>
                          <AlertTriangle className="w-3 h-3" style={{ color: "hsl(0, 65%, 45%)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-card-foreground">{t("review.criteria.alerts.overdue.label")}</p>
                          <p className="text-xs text-muted-foreground">{t("review.criteria.alerts.overdue.desc")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "hsl(25, 55%, 97%)" }}>
                          <Clock className="w-3 h-3" style={{ color: "hsl(25, 55%, 40%)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-card-foreground">{t("review.criteria.alerts.dueToday.label")}</p>
                          <p className="text-xs text-muted-foreground">{t("review.criteria.alerts.dueToday.desc")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "hsl(225, 50%, 97%)" }}>
                          <CalendarCheck className="w-3 h-3" style={{ color: "hsl(225, 50%, 35%)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-card-foreground">{t("review.criteria.alerts.comingUp.label")}</p>
                          <p className="text-xs text-muted-foreground">{t("review.criteria.alerts.comingUp.desc")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mastery Levels */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{t("review.criteria.mastery.title")}</h4>
                    <div className="space-y-1.5">
                      {[
                        { level: "New", condition: t("review.criteria.mastery.new"), color: "hsl(230, 15%, 50%)", bg: "hsl(230, 15%, 95%)" },
                        { level: "Learning", condition: t("review.criteria.mastery.learning"), color: "hsl(25, 55%, 40%)", bg: "hsl(25, 55%, 95%)" },
                        { level: "Reviewing", condition: t("review.criteria.mastery.reviewing"), color: "hsl(225, 50%, 35%)", bg: "hsl(225, 50%, 95%)" },
                        { level: "Mastered", condition: t("review.criteria.mastery.mastered"), color: "hsl(145, 45%, 30%)", bg: "hsl(145, 45%, 95%)" },
                      ].map((item) => (
                        <div key={item.level} className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 w-20 text-center"
                            style={{ color: item.color, backgroundColor: item.bg }}
                          >
                            {item.level}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retention Colors */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{t("review.criteria.retention.title")}</h4>
                    <div className="space-y-1.5">
                      {[
                        { range: "70%+", color: "hsl(145, 45%, 35%)", label: t("review.criteria.retention.stable") },
                        { range: "50-69%", color: "hsl(175, 45%, 32%)", label: t("review.criteria.retention.good") },
                        { range: "30-49%", color: "hsl(25, 55%, 40%)", label: t("review.criteria.retention.caution") },
                        { range: "<30%", color: "hsl(0, 65%, 45%)", label: t("review.criteria.retention.needsReview") },
                      ].map((item) => (
                        <div key={item.range} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-medium text-card-foreground w-16">{item.range}</span>
                          <span className="text-xs text-muted-foreground">— {item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

      {/* Review Alerts */}
      {(() => {
        const alertItems = filtered.filter((r) => r.reviewCount > 0 && (r.isOverdue || r.isDueToday))
        if (alertItems.length === 0) return null
        return (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-[hsl(0,65%,45%)]" />
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">{t("review.alert.title")}</h3>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-red-500 text-white">{alertItems.length}</span>
            </div>
            <div className="space-y-2">
              {alertItems.sort((a, b) => a.retention - b.retention).map((item) => {
                const info = SECTION_INFO[item.section]
                const retColor = getRetentionColor(item.retention)
                return (
                  <button
                    key={item.chapterId}
                    onClick={() => setSelectedChapterId(item.chapterId === selectedChapterId ? null : item.chapterId)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-card/80 hover:bg-card transition-colors text-left"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: item.isOverdue ? "hsl(0,65%,45%)" : "hsl(25,55%,40%)" }} />
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: info.color }}
                    >
                      {item.section}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">Ch.{item.chapterNumber} {item.chapterTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium" style={{ color: retColor }}>{t("review.alert.retention")} {item.retention}%</span>
                        <span className="text-xs text-muted-foreground">{item.daysSinceLastStudy} {t("review.alert.daysAgo")}</span>
                        <span className="text-xs font-medium" style={{ color: item.isOverdue ? "hsl(0,65%,45%)" : "hsl(25,55%,40%)" }}>
                          {item.isOverdue ? t("review.alert.overdue") : t("review.alert.dueToday")}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Per-Chapter Forgetting Curve */}
      {(() => {
        const studiedChapters = filtered.filter((r) => r.reviewCount > 0 && r.daysSinceLastStudy >= 0)
          .sort((a, b) => a.retention - b.retention)
        if (studiedChapters.length === 0) return null

        const selected = selectedChapterId
          ? studiedChapters.find((c) => c.chapterId === selectedChapterId) || null
          : null

        // Chart: show selected chapter's curve, or if none selected, show all as overview
        const maxDays = selected ? Math.max(Math.ceil(selected.stability * 4), 30) : 60

        // Generate curve data
        const curveData = Array.from({ length: maxDays + 1 }, (_, day) => {
          const point: Record<string, number> = { day }
          if (selected) {
            point.retention = calculateRetention(day, selected.stability)
            // Also show "next review" curve (what it would look like after one more review)
            const nextStability = calculateStability(selected.reviewCount + 1)
            point.nextRetention = calculateRetention(day, nextStability)
          } else {
            // Overview: show all studied chapters
            studiedChapters.forEach((ch) => {
              point[ch.chapterId] = calculateRetention(day, ch.stability)
            })
          }
          return point
        })

        return (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="font-semibold text-card-foreground">{t("review.chart.title")}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected ? `Ch.${selected.chapterNumber} ${selected.chapterTitle}${t("review.chart.selectedDesc")}` : t("review.chart.defaultDesc")}
              </p>
            </div>

            {/* Chapter selector */}
            <div className="px-6 pt-4 pb-2 flex flex-wrap gap-1.5">
              {studiedChapters.map((ch) => {
                const info = SECTION_INFO[ch.section]
                const isSelected = selectedChapterId === ch.chapterId
                const isAlert = ch.isOverdue || ch.isDueToday
                return (
                  <button
                    key={ch.chapterId}
                    onClick={() => setSelectedChapterId(isSelected ? null : ch.chapterId)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      isSelected
                        ? "border-current shadow-sm"
                        : isAlert
                          ? "border-[hsl(0,65%,80%)] bg-[hsl(0,65%,97%)] hover:bg-[hsl(0,65%,94%)]"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                    )}
                    style={isSelected ? { color: info.color, backgroundColor: `${info.color}12` } : undefined}
                  >
                    <span
                      className="w-4 h-4 rounded text-[7px] font-bold text-white flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: info.color }}
                    >
                      {ch.section.charAt(0)}
                    </span>
                    <span className="truncate max-w-[120px]">Ch.{ch.chapterNumber}</span>
                    <span className="text-[9px]" style={{ color: getRetentionColor(ch.retention) }}>{ch.retention}%</span>
                    {isAlert && <AlertTriangle className="w-3 h-3 text-[hsl(0,65%,45%)]" />}
                  </button>
                )
              })}
            </div>

            {/* Chart */}
            <div className="px-6 pb-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "hsl(230, 15%, 25%)" : "hsl(230, 12%, 90%)"} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDark ? "hsl(230, 15%, 65%)" : "hsl(230, 8%, 46%)" }}
                      label={{ value: t("review.chart.xLabel"), position: "insideBottomRight", offset: -4, fontSize: 10, fill: isDark ? "hsl(230, 15%, 65%)" : "hsl(230, 8%, 46%)" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDark ? "hsl(230, 15%, 65%)" : "hsl(230, 8%, 46%)" }}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "hsl(232, 30%, 15%)" : "hsl(232, 47%, 8%)",
                        border: isDark ? "1px solid hsl(232, 20%, 30%)" : "none",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "retention") return [`${value}%`, t("review.chart.currentCurve")]
                        if (name === "nextRetention") return [`${value}%`, t("review.chart.nextCurve")]
                        const ch = studiedChapters.find((c) => c.chapterId === name)
                        return [`${value}%`, ch ? `Ch.${ch.chapterNumber} ${ch.chapterTitle}` : name]
                      }}
                      labelFormatter={(day) => `${day}${t("review.chart.daysSuffix")}`}
                    />
                    {/* Reference line at 30% threshold */}
                    {selected ? (
                      <>
                        <Line
                          type="monotone"
                          dataKey="retention"
                          stroke={brightenForDark(SECTION_INFO[selected.section].color, isDark)}
                          strokeWidth={2.5}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="nextRetention"
                          stroke={brightenForDark(SECTION_INFO[selected.section].color, isDark)}
                          strokeWidth={1.5}
                          strokeDasharray="6 3"
                          dot={false}
                          opacity={isDark ? 0.6 : 0.4}
                        />
                        <ReferenceDot
                          x={selected.daysSinceLastStudy}
                          y={selected.retention}
                          r={7}
                          fill={selected.isOverdue ? (isDark ? "hsl(0, 65%, 60%)" : "hsl(0,65%,45%)") : brightenForDark(SECTION_INFO[selected.section].color, isDark)}
                          stroke={isDark ? "hsl(230, 15%, 20%)" : "white"}
                          strokeWidth={2}
                        />
                      </>
                    ) : (
                      studiedChapters.map((ch) => (
                        <Line
                          key={ch.chapterId}
                          type="monotone"
                          dataKey={ch.chapterId}
                          stroke={brightenForDark(SECTION_INFO[ch.section].color, isDark)}
                          strokeWidth={1.5}
                          dot={false}
                          opacity={isDark ? 0.8 : 0.6}
                        />
                      ))
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Selected chapter detail */}
            {selected && (
              <div className="px-6 pb-5 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("review.detail.retention")}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: getRetentionColor(selected.retention) }}>{selected.retention}%</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("review.detail.reviewCount")}</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{selected.reviewCount}<span className="text-xs font-normal text-muted-foreground ml-1">{t("review.detail.reviewCountUnit")}</span></p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("review.detail.lastStudied")}</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{selected.daysSinceLastStudy}<span className="text-xs font-normal text-muted-foreground ml-1">{t("review.detail.daysAgoUnit")}</span></p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("review.detail.nextReview")}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: selected.isOverdue || selected.isDueToday ? "hsl(0,65%,45%)" : "hsl(225,50%,35%)" }}>
                      {formatNextDate(selected.nextReviewDate, t)}
                    </p>
                  </div>
                </div>
                {/* Legend for selected view */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: brightenForDark(SECTION_INFO[selected.section].color, isDark) }} />
                    <span className="text-xs text-muted-foreground">{t("review.chart.currentCurve")}（{selected.reviewCount}{t("review.detail.reviewsSuffix")}）</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 rounded-full opacity-40" style={{ backgroundColor: brightenForDark(SECTION_INFO[selected.section].color, isDark), borderTop: "2px dashed" }} />
                    <span className="text-xs text-muted-foreground">{t("review.chart.nextCurve")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.isOverdue ? (isDark ? "hsl(0, 65%, 60%)" : "hsl(0,65%,45%)") : brightenForDark(SECTION_INFO[selected.section].color, isDark), border: isDark ? "2px solid hsl(230, 15%, 20%)" : "2px solid white" }} />
                    <span className="text-xs text-muted-foreground">{t("review.chart.currentPosition")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Section Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <button
          onClick={() => setSelectedSection("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
            selectedSection === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-border"
          )}
        >
          {t("review.allSections")}
        </button>
        {(["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).map((section) => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              selectedSection === section
                ? "text-[hsl(0,0%,100%)]"
                : "bg-muted text-muted-foreground hover:bg-border"
            )}
            style={selectedSection === section ? { backgroundColor: SECTION_INFO[section].color } : undefined}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Urgency Groups */}
      {groups.map((group) => {
        if (group.items.length === 0) return null
        const Icon = group.icon
        return (
          <div key={group.id}>
            {/* Group Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: group.bgColor }}
              >
                <Icon className="w-4 h-4" style={{ color: group.color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {group.label}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({group.items.length})</span>
                </h3>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
            </div>

            {/* Chapter Rows */}
            <div className="bg-card rounded-xl border overflow-hidden" style={{ borderColor: group.borderColor }}>
              {group.items.map((item, idx) => {
                const info = SECTION_INFO[item.section]
                const masteryInfo = getMasteryLevelInfo(item.masteryLevel)
                const retColor = getRetentionColor(item.retention)

                return (
                  <div key={item.chapterId} className={cn(idx < group.items.length - 1 && "border-b border-border")}>
                  <button
                    onClick={() => handleChapterClick(item.chapterId)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors group relative"
                  >
                    {/* Section badge */}
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-[9px] font-bold text-[hsl(0,0%,100%)] flex-shrink-0"
                      style={{ backgroundColor: info.color }}
                    >
                      {item.section}
                    </div>

                    {/* Chapter info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ch.{item.chapterNumber}</span>
                        <span className="text-sm font-medium text-card-foreground truncate">{item.chapterTitle}</span>
                      </div>
                      {/* Retention bar + stats row */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${item.retention}%`, backgroundColor: retColor }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right" style={{ color: retColor }}>
                            {item.retention}%
                          </span>
                        </div>
                        {/* Mastery badge */}
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded"
                          style={{ color: masteryInfo.color, backgroundColor: masteryInfo.bgColor }}
                        >
                          {masteryInfo.label}
                        </span>
                        {/* Extra stats */}
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                          {item.daysSinceLastStudy >= 0 && (
                            <span>{item.daysSinceLastStudy}{t("review.dAgo")}</span>
                          )}
                          <span className="hidden sm:inline">{t("review.next")}: {formatNextDate(item.nextReviewDate, t)}</span>
                          <span className="hidden sm:inline">{item.reviewCount} {t("review.reviews")}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>

                  {/* Recall Rating Buttons */}
                  {onRecallRating && item.reviewCount > 0 && (
                    <div className="px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">{t("review.recall.title")}</span>
                      {ratedChapters[item.chapterId] !== undefined ? (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{
                            color: RECALL_COLORS[ratedChapters[item.chapterId]],
                            backgroundColor: RECALL_BG_COLORS[ratedChapters[item.chapterId]],
                          }}
                        >
                          {t(`review.recall.${ratedChapters[item.chapterId]}` as "review.recall.0")}
                        </span>
                      ) : (
                        ([0, 1, 2, 3] as RecallRating[]).map((rating) => (
                          <button
                            key={rating}
                            onClick={(e) => {
                              e.stopPropagation()
                              setRatedChapters(prev => ({ ...prev, [item.chapterId]: rating }))
                              onRecallRating(item.chapterId, rating)
                            }}
                            className="text-[11px] font-medium px-2 py-0.5 rounded border transition-all hover:scale-105"
                            style={{
                              color: RECALL_COLORS[rating],
                              backgroundColor: RECALL_BG_COLORS[rating],
                              borderColor: RECALL_COLORS[rating] + "40",
                            }}
                          >
                            {t(`review.recall.${rating}` as "review.recall.0")}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatNextDate(dateStr: string, t?: (key: string) => string): string {
  const d = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return t ? t("review.today") : "Today"
  if (diff === 1) return t ? t("review.tomorrow") : "Tomorrow"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
