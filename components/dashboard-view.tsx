"use client"

import { useState } from "react"
import { ArrowUpRight, Clock, Flame, Lightbulb, NotebookPen, ChevronDown, BookOpen, Target, Brain, X, BookMarked, ClipboardList, RefreshCw, Play, HelpCircle } from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { type StudyProgress, type Chapter, type StudyLog, type EssenceNote, SECTION_INFO, type ExamSection } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { useTheme } from "next-themes"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { type ChapterRetention, getReviewQueueForDashboard, getMasteryLevelInfo, getRetentionColor } from "@/lib/spaced-repetition"

type View = "dashboard" | "chapters" | "study-log" | "analytics" | "settings" | "review"

interface DashboardViewProps {
  progress: StudyProgress[]
  chapters: Chapter[]
  onViewChange: (view: View) => void
  completedSections?: ExamSection[]
  studyLogs: StudyLog[]
  essenceNotes: EssenceNote[]
  streak: number
  chapterRetentions: ChapterRetention[]
  onStartTour?: () => void
}

// Lighten an HSL color for dark-mode text readability
function getLightColor(hslColor: string): string {
  const match = hslColor.match(/hsl\((\d+)[,\s]+(\d+)%[,\s]+(\d+)%\)/)
  if (!match) return hslColor
  const [, h, s, l] = match
  // Bump lightness to at least 55% for readability
  const newL = Math.max(Number(l), 55)
  return `hsl(${h}, ${s}%, ${newL}%)`
}

export function DashboardView({ chapters, onViewChange, completedSections = [], studyLogs, essenceNotes, streak, chapterRetentions, onStartTour }: DashboardViewProps) {
  const { t, locale } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [openSection, setOpenSection] = useState<ExamSection | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [showReviewHelp, setShowReviewHelp] = useState(false)

  // Compute stats from studyLogs
  const totalHours = studyLogs.reduce((a, b) => a + b.studyHours, 0)
  const activeDays = new Set(studyLogs.map(l => l.date)).size

  // Per-section hours
  const sectionHoursData = (["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).map(section => ({
    section,
    hours: studyLogs.filter(l => l.section === section).reduce((a, b) => a + b.studyHours, 0),
    color: SECTION_INFO[section].color,
  }))

  // Weekly study hours chart — derive from studyLogs (last 7 days)
  const weeklyData = (() => {
    const days = [t("day.sun"), t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri"), t("day.sat")]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const result: { day: string; date: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const dayHours = studyLogs
        .filter(l => l.date === dateStr)
        .reduce((a, b) => a + b.studyHours, 0)
      result.push({ day: days[d.getDay()], date: dateStr, hours: parseFloat(dayHours.toFixed(1)) })
    }
    return result
  })()

  // Section data for expandable cards
  const sections: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP", "ISC"]

  function getSectionData(section: ExamSection) {
    const info = SECTION_INFO[section]
    const sectionChapters = chapters.filter(c => c.section === section)
    const sectionLogs = studyLogs.filter(l => l.section === section)
    const sectionNotes = essenceNotes.filter(n => {
      const ch = chapters.find(c => c.id === n.chapterId)
      return ch?.section === section
    })
    const sectionHours = sectionLogs.reduce((a, b) => a + b.studyHours, 0)
    const insightCount = sectionNotes.reduce((a, b) => a + b.insights.length, 0)
    const studiedChapterIds = new Set(sectionLogs.map(l => l.chapterId))
    const chaptersStudied = studiedChapterIds.size
    const lastStudiedLog = sectionLogs.sort((a, b) => b.date.localeCompare(a.date))[0]
    const lastStudied = lastStudiedLog?.date || ""

    return {
      info,
      sectionChapters,
      sectionLogs,
      sectionNotes,
      sectionHours,
      insightCount,
      chaptersStudied,
      totalChapters: sectionChapters.length,
      lastStudied,
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return t("dashboard.today")
    if (diff === 1) return t("dashboard.yesterday")
    return d.toLocaleDateString(locale === "es" ? "es" : "en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground text-balance">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* Getting Started Guide (collapsible) */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/20 transition-colors"
        >
          <h3 className="text-sm font-semibold text-card-foreground">{t("guide.title")}</h3>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${guideOpen ? "rotate-180" : ""}`} />
        </button>
        {guideOpen && (
          <div className="px-5 pb-5 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(225,50%,22%)] text-white text-xs font-bold flex-shrink-0">1</span>
                <div>
                  <p className="text-sm font-medium text-card-foreground flex items-center gap-1.5"><BookMarked className="w-3.5 h-3.5" />{t("guide.step1.title")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("guide.step1.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(225,50%,22%)] text-white text-xs font-bold flex-shrink-0">2</span>
                <div>
                  <p className="text-sm font-medium text-card-foreground flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" />{t("guide.step2.title")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("guide.step2.desc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(225,50%,22%)] text-white text-xs font-bold flex-shrink-0">3</span>
                <div>
                  <p className="text-sm font-medium text-card-foreground flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" />{t("guide.step3.title")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("guide.step3.desc")}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              {onStartTour && (
                <button
                  onClick={onStartTour}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(225,50%,22%)] text-white text-xs font-medium hover:bg-[hsl(225,50%,28%)] transition-colors"
                >
                  <Play className="w-3 h-3" />
                  {t("guide.startTour")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2 Stat Cards: Study Hours (with section breakdown) + Streak */}
      <div data-tour="stats-cards" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Study Hours with per-section breakdown */}
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full rounded-r" style={{ backgroundColor: "hsl(225, 50%, 22%)" }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("dashboard.totalStudyHours")}</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">{totalHours.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-1">h</span></p>
              <p className="text-xs text-muted-foreground mt-1">{activeDays} {t("dashboard.daysActive")}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(225, 50%, 96%)" }}>
              <Clock className="w-5 h-5" style={{ color: "hsl(225, 50%, 22%)" }} />
            </div>
          </div>
          {/* Per-section hours breakdown */}
          <div className="mt-4 space-y-1.5">
            {sectionHoursData.map((s) => {
              const maxH = Math.max(...sectionHoursData.map(x => x.hours), 1)
              const barWidth = (s.hours / maxH) * 100
              return (
                <div key={s.section} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-7">{s.section}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{s.hours.toFixed(1)}h</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full rounded-r" style={{ backgroundColor: "hsl(25, 55%, 35%)" }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("dashboard.studyStreak")}</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">{streak}</p>
              <p className="text-xs text-muted-foreground mt-1">{streak === 1 ? t("dashboard.dayInARow") : t("dashboard.daysInARow")}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(25, 55%, 95%)" }}>
              <Flame className="w-5 h-5" style={{ color: "hsl(25, 55%, 35%)" }} />
            </div>
          </div>
          {/* Last 14 days activity grid */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">{t("dashboard.last14Days")}</p>
            <div className="flex gap-1.5 flex-wrap">
              {(() => {
                const studyDates = new Set(studyLogs.map(l => l.date))
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const days: { date: string; label: string; hasStudy: boolean; hours: number }[] = []
                for (let i = 13; i >= 0; i--) {
                  const d = new Date(today)
                  d.setDate(d.getDate() - i)
                  const dateStr = d.toISOString().split("T")[0]
                  const dayHours = studyLogs.filter(l => l.date === dateStr).reduce((a, b) => a + b.studyHours, 0)
                  days.push({
                    date: dateStr,
                    label: d.toLocaleDateString(locale === "es" ? "es" : "en-US", { month: "short", day: "numeric" }),
                    hasStudy: studyDates.has(dateStr),
                    hours: dayHours,
                  })
                }
                return days.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.label}${day.hasStudy ? ` — ${day.hours.toFixed(1)}h` : ""}`}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-medium transition-colors"
                    style={day.hasStudy
                      ? { backgroundColor: "hsl(25, 55%, 35%)", color: "white" }
                      : { backgroundColor: "hsl(25, 10%, 93%)" }
                    }
                  >
                    {new Date(day.date + "T00:00:00").getDate()}
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Section Cards (expandable) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t("dashboard.sections.title")}</h3>
          <button
            onClick={() => onViewChange("chapters")}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("dashboard.sections.viewAll")} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((section) => {
            const data = getSectionData(section)
            const isOpen = openSection === section
            const isCompleted = completedSections.includes(section)
            const progress = data.totalChapters > 0 ? Math.round((data.chaptersStudied / data.totalChapters) * 100) : 0

            return (
              <Collapsible
                key={section}
                open={isOpen}
                onOpenChange={(open) => setOpenSection(open ? section : null)}
                className={`bg-card rounded-xl border border-border overflow-hidden transition-all ${isOpen ? "sm:col-span-2" : ""} ${isCompleted ? "opacity-45" : ""}`}
              >
                {/* Colored top strip */}
                <div className="h-1" style={{ backgroundColor: isCompleted ? "hsl(0 0% 60%)" : data.info.color }} />
                <CollapsibleTrigger asChild>
                  <button className="w-full p-5 text-left hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-[hsl(0,0%,100%)] flex-shrink-0"
                        style={{ backgroundColor: isCompleted ? "hsl(0 0% 60%)" : data.info.color }}
                      >
                        {section}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                          {data.info.fullName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex-1 max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%`, backgroundColor: data.info.color }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{data.chaptersStudied}/{data.totalChapters} {t("dashboard.chaptersStudied")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-shrink-0">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{data.sectionHours.toFixed(1)}h</span>
                        <span className="hidden sm:flex items-center gap-1"><Lightbulb className="w-3 h-3" />{data.insightCount}</span>
                        {data.lastStudied && <span className="hidden sm:inline">{formatDate(data.lastStudied)}</span>}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border px-5 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Recent study logs */}
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("dashboard.recentStudySessions")}</h5>
                        {data.sectionLogs.length === 0 ? (
                          <div>
                            <p className="text-xs text-muted-foreground">{t("dashboard.section.noSessions")}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.section.startStudying")}</p>
                            <button
                              onClick={() => onViewChange("chapters")}
                              className="mt-2 text-xs font-medium hover:underline transition-colors"
                              style={{ color: isDark ? getLightColor(data.info.color) : data.info.color }}
                            >
                              {t("dashboard.section.openChapters")} →
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {data.sectionLogs
                              .sort((a, b) => b.date.localeCompare(a.date))
                              .slice(0, 5)
                              .map((log) => {
                                const acc = log.questionsAnswered > 0 ? Math.round((log.correctAnswers / log.questionsAnswered) * 100) : 0
                                return (
                                  <div key={log.id} className="flex items-center gap-3 py-1.5">
                                    <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{formatDate(log.date)}</span>
                                    <span className="text-xs text-card-foreground truncate flex-1">{log.chapterTitle}</span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{log.studyHours}h</span>
                                    {log.questionsAnswered > 0 && (
                                      <span className="text-xs flex-shrink-0" style={{ color: acc >= 75 ? (isDark ? getLightColor(data.info.color) : data.info.color) : "hsl(0, 72%, 51%)" }}>{acc}%</span>
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                        )}
                        <button
                          onClick={() => onViewChange("study-log")}
                          className="mt-3 text-xs font-medium hover:underline transition-colors"
                          style={{ color: isDark ? getLightColor(data.info.color) : data.info.color }}
                        >
                          {t("dashboard.viewAllLogs")} →
                        </button>
                      </div>
                      {/* Recent essence note insights */}
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("dashboard.recentInsights")}</h5>
                        {data.sectionNotes.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{t("dashboard.noEssenceNotes")}</p>
                        ) : (
                          <div className="space-y-2">
                            {data.sectionNotes
                              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                              .slice(0, 3)
                              .flatMap((note) => note.insights.slice(0, 2).map((insight, idx) => (
                                <div key={`${note.id}-${idx}`} className="flex items-start gap-2 py-1.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: data.info.color }} />
                                  <div>
                                    <p className="text-xs font-medium text-card-foreground">{insight.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{insight.body}</p>
                                  </div>
                                </div>
                              )))}
                          </div>
                        )}
                        <button
                          onClick={() => onViewChange("chapters")}
                          className="mt-3 text-xs font-medium hover:underline transition-colors"
                          style={{ color: isDark ? getLightColor(data.info.color) : data.info.color }}
                        >
                          {t("dashboard.viewChapters")} →
                        </button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </div>

      {/* Weekly Study Hours Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-card-foreground">{t("dashboard.weeklyStudyHours")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.weeklySubtitle")}</p>
          </div>
          <button
            onClick={() => onViewChange("analytics")}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("dashboard.viewDetails")} <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(230, 12%, 90%)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(230, 8%, 46%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(230, 8%, 46%)" }} unit="h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(232, 47%, 8%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}h`, t("dashboard.studyHours")]}
                cursor={{ fill: "hsl(230, 10%, 93%, 0.7)" }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="hsl(225, 50%, 22%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Review Queue */}
      {(() => {
        const reviewQueue = getReviewQueueForDashboard(chapterRetentions, 5)
        if (reviewQueue.length === 0) return null
        return (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-card-foreground text-sm">{t("dashboard.reviewQueue.title")}</h3>
                  <p className="text-xs text-muted-foreground">{t("dashboard.reviewQueue.desc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReviewHelp(!showReviewHelp)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {showReviewHelp ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onViewChange("review")}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("dashboard.reviewQueue.viewSchedule")} <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            {showReviewHelp && (
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-card-foreground">
                    {locale === "es" ? "Capítulos que más necesitan repaso ahora:" : "Chapters that most need review right now:"}
                  </p>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p><span className="font-semibold text-card-foreground">{locale === "es" ? "Barra de retención" : "Retention Bar"}</span> — {locale === "es" ? "Cuánto recuerdas del capítulo. Rojo = urgente, verde = bien retenido." : "How much you remember. Red = urgent, green = well retained."}</p>
                    <p><span className="font-semibold text-card-foreground">{locale === "es" ? "Nivel de dominio" : "Mastery Level"}</span> — {locale === "es" ? "New → Learning → Reviewing → Mastered. Basado en cuántas veces has repasado." : "New → Learning → Reviewing → Mastered. Based on how many times you've reviewed."}</p>
                    <p><span className="font-semibold text-card-foreground">{locale === "es" ? "Días atrás" : "Days Ago"}</span> — {locale === "es" ? "Cuánto tiempo desde tu último estudio de este capítulo." : "How long since you last studied this chapter."}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                    {locale === "es" ? "Ordenados por urgencia — repasa los de arriba primero. Haz clic en 'View Schedule' para ver el calendario completo." : "Sorted by urgency — review the top ones first. Click 'View Schedule' for the full review calendar."}
                  </p>
                </div>
              </div>
            )}
            {reviewQueue.map((item, idx) => {
              const info = SECTION_INFO[item.section]
              const masteryInfo = getMasteryLevelInfo(item.masteryLevel)
              const retColor = getRetentionColor(item.retention)
              return (
                <div key={item.chapterId} className={`px-4 py-3 flex items-center gap-3 ${idx < reviewQueue.length - 1 ? "border-b border-border" : ""}`}>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-[9px] font-bold text-[hsl(0,0%,100%)] flex-shrink-0"
                    style={{ backgroundColor: info.color }}
                  >
                    {item.section}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{item.chapterTitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 w-24">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.retention}%`, backgroundColor: retColor }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: retColor }}>{item.retention}%</span>
                      </div>
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ color: masteryInfo.color, backgroundColor: masteryInfo.bgColor }}
                      >
                        {masteryInfo.label}
                      </span>
                      {item.daysSinceLastStudy >= 0 && (
                        <span className="text-xs text-muted-foreground">{item.daysSinceLastStudy}{t("dashboard.dAgo")}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Today's Study */}
      {(() => {
        const todayStr = new Date().toISOString().split("T")[0]
        const todayLogs = studyLogs.filter(l => l.date === todayStr)
        const todayHours = todayLogs.reduce((a, b) => a + b.studyHours, 0)
        const todayQuestions = todayLogs.reduce((a, b) => a + b.questionsAnswered, 0)
        const todayCorrect = todayLogs.reduce((a, b) => a + b.correctAnswers, 0)
        const todayAcc = todayQuestions > 0 ? Math.round((todayCorrect / todayQuestions) * 100) : 0

        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{t("dashboard.today")}</h3>
                {todayLogs.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {todayHours.toFixed(1)}h · {todayQuestions}Q · {todayAcc}%
                  </span>
                )}
              </div>
              <button
                onClick={() => onViewChange("study-log")}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("dashboard.recentActivity.viewLog")} <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {todayLogs.length === 0 ? (
                <div className="p-6 text-center">
                  <NotebookPen className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t("dashboard.empty.noSessions")}</p>
                  <button
                    onClick={() => onViewChange("chapters")}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[hsl(225,50%,22%)] text-white text-xs font-medium hover:bg-[hsl(225,50%,28%)] transition-colors"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    {t("dashboard.empty.openChapters")}
                  </button>
                </div>
              ) : (
                todayLogs.map((log, idx) => {
                  const info = SECTION_INFO[log.section]
                  const acc = log.questionsAnswered > 0 ? Math.round((log.correctAnswers / log.questionsAnswered) * 100) : 0
                  return (
                    <button
                      key={log.id}
                      onClick={() => onViewChange("study-log")}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors ${idx < todayLogs.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold text-[hsl(0,0%,100%)] flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      >
                        {log.section}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{log.chapterTitle}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.studyHours}h</span>
                          {log.questionsAnswered > 0 && (
                            <>
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{log.questionsAnswered}Q</span>
                              <span className="flex items-center gap-1" style={{ color: acc >= 75 ? info.color : "hsl(0, 72%, 51%)" }}>
                                <Target className="w-3 h-3" />{acc}%
                              </span>
                            </>
                          )}
                          {log.memo && <span className="truncate max-w-[150px]">{log.memo}</span>}
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
