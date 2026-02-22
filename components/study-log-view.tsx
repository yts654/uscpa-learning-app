"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus, Filter, Calendar, Clock, BookOpen, ChevronDown, ChevronUp, X, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2, BarChart3, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"
import { SECTION_INFO, type ExamSection, type Chapter, type StudyLog } from "@/lib/study-data"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from "recharts"

interface StudyLogViewProps {
  chapters: Chapter[]
  studyLogs: StudyLog[]
  onUpdateLogs: (logs: StudyLog[]) => void
}

interface WeekSummary {
  weekLabel: string
  startDate: string
  endDate: string
  totalHours: number
  prevWeekHours: number
  sections: Record<ExamSection, { hours: number; mc: number; tbs: number; mcCorrect: number; tbsCorrect: number }>
  comments: string[]
  logs: StudyLog[]
}

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatWeekDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString(locale === "es" ? "es" : "en-US", { month: "short", day: "numeric" })
}

function generateWeekComments(
  sections: Record<ExamSection, { hours: number; mc: number; tbs: number }>,
  totalHours: number,
  prevWeekHours: number,
  t: (key: string) => string
): string[] {
  const comments: string[] = []
  const allSections: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP", "ISC"]

  for (const section of allSections) {
    const s = sections[section]
    if (s.hours === 0) continue
    const total = s.mc + s.tbs
    if (total === 0) continue
    const mcRatio = s.mc / total
    if (mcRatio > 0.8) {
      comments.push(`${section}: ${t("studyLog.weekComment.heavyMC").replace("{n}", String(Math.round(mcRatio * 100)))}`)
    } else if (mcRatio < 0.2) {
      comments.push(`${section}: ${t("studyLog.weekComment.heavyTBS").replace("{n}", String(Math.round((1 - mcRatio) * 100)))}`)
    } else {
      comments.push(`${section}: ${t("studyLog.weekComment.goodBalance")}`)
    }
  }

  if (prevWeekHours > 0 && totalHours > 0) {
    const change = ((totalHours - prevWeekHours) / prevWeekHours) * 100
    if (change <= -30) {
      comments.push(t("studyLog.weekComment.hoursDown").replace("{n}", String(Math.abs(Math.round(change)))))
    } else if (change >= 30) {
      comments.push(t("studyLog.weekComment.hoursUp").replace("{n}", String(Math.round(change))))
    }
  }

  return comments
}

// ── Charts Component ─────────────────────────────────────────────
const ALL_SECTIONS: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP", "ISC"]
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function StudyCharts({ logs, locale }: { logs: StudyLog[]; locale: string }) {
  const [chartMode, setChartMode] = useState<"weekly" | "monthly">("weekly")
  const [showHelp, setShowHelp] = useState(false)

  // Weekly chart data: hours per day of the current week, stacked by section
  const weeklyData = useMemo(() => {
    if (logs.length === 0) return []
    const now = new Date()
    const monday = getMonday(now)

    return DAY_LABELS.map((label, i) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      const dayLogs = logs.filter(l => l.date === dateStr)
      const entry: Record<string, number | string> = { name: label }
      let dayTotal = 0
      for (const s of ALL_SECTIONS) {
        const sLogs = dayLogs.filter(l => l.section === s)
        const h = parseFloat(sLogs.reduce((a, b) => a + b.studyHours, 0).toFixed(1))
        entry[s] = h
        dayTotal += h
      }
      entry.totalHours = parseFloat(dayTotal.toFixed(1))
      return entry
    })
  }, [logs])

  // Monthly chart data: hours per week for last 8 weeks
  const monthlyData = useMemo(() => {
    if (logs.length === 0) return []
    const now = new Date()
    const currentMonday = getMonday(now)
    const weeks: { name: string; dateKey: string }[] = []
    for (let i = 7; i >= 0; i--) {
      const monday = new Date(currentMonday)
      monday.setDate(monday.getDate() - i * 7)
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      const fmt = (d: Date) => d.toLocaleDateString(locale === "es" ? "es" : "en-US", { month: "short", day: "numeric" })
      weeks.push({ name: `${fmt(monday)}`, dateKey: monday.toISOString().split("T")[0] })
    }

    return weeks.map(({ name, dateKey }) => {
      const weekStart = new Date(dateKey + "T00:00:00")
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const weekLogs = logs.filter(l => {
        const d = new Date(l.date + "T00:00:00")
        return d >= weekStart && d <= weekEnd
      })
      const entry: Record<string, number | string> = { name }
      let dayTotal = 0
      for (const s of ALL_SECTIONS) {
        const sLogs = weekLogs.filter(l => l.section === s)
        const h = parseFloat(sLogs.reduce((a, b) => a + b.studyHours, 0).toFixed(1))
        entry[s] = h
        dayTotal += h
      }
      entry.totalHours = parseFloat(dayTotal.toFixed(1))
      return entry
    })
  }, [logs, locale])

  const chartData = chartMode === "weekly" ? weeklyData : monthlyData
  const hasData = chartData.some(d => ALL_SECTIONS.some(s => (d[s] as number) > 0))

  if (logs.length === 0) return null

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {chartMode === "weekly" ? "This Week" : "Last 8 Weeks"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {showHelp ? <X className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
          </button>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setChartMode("weekly")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              chartMode === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setChartMode("monthly")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              chartMode === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
        </div>
        </div>
      </div>

      {showHelp && (
        <div className="px-5 py-4 border-b border-border bg-muted/20">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-card-foreground">
              {locale === "es" ? "Visualiza tus patrones de estudio:" : "Visualize your study patterns:"}
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="font-semibold text-card-foreground">{locale === "es" ? "Barras apiladas" : "Stacked Bars"}</span> — {locale === "es" ? "Horas de estudio por sección (FAR, AUD, REG, etc.) apiladas por día o semana." : "Study hours by section (FAR, AUD, REG, etc.) stacked per day or week."}</p>
              <p><span className="font-semibold text-card-foreground">{locale === "es" ? "Línea de tendencia" : "Trend Line"}</span> — {locale === "es" ? "Total de horas de estudio por período para ver tu consistencia." : "Total study hours per period to track your consistency."}</p>
              <p><span className="font-semibold text-card-foreground">Weekly / Monthly</span> — {locale === "es" ? "Cambia entre vista semanal (7 días) y mensual (8 semanas)." : "Switch between weekly (7 days) and monthly (8 weeks) view."}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 space-y-6">
        {/* Study Hours Stacked Bar Chart */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Study Hours by Section</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="h" width={35} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                {ALL_SECTIONS.map(s => (
                  <Bar key={s} dataKey={s} stackId="hours" fill={SECTION_INFO[s].color} radius={s === "ISC" ? [3, 3, 0, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          )}
        </div>

        {/* Study Hours Line Chart */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Study Hours Trend</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="h" width={35} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(value: number) => [`${value}h`, "Study Hours"]}
                />
                <Line type="monotone" dataKey="totalHours" stroke="hsl(175 45% 40%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(175 45% 40%)" }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {ALL_SECTIONS.map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SECTION_INFO[s].color }} />
              <span className="text-[10px] text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StudyLogView({ chapters, studyLogs, onUpdateLogs }: StudyLogViewProps) {
  const { t, locale } = useLanguage()
  const logs = studyLogs
  const setLogs = onUpdateLogs
  const [selectedSection, setSelectedSection] = useState<ExamSection | "ALL">("ALL")
  const [showForm, setShowForm] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null)

  // Form state — MC/TBS split
  const [formSection, setFormSection] = useState<ExamSection>("FAR")
  const [formChapterId, setFormChapterId] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formHours, setFormHours] = useState("")
  const [formMcQuestions, setFormMcQuestions] = useState("")
  const [formMcCorrect, setFormMcCorrect] = useState("")
  const [formTbsQuestions, setFormTbsQuestions] = useState("")
  const [formTbsCorrect, setFormTbsCorrect] = useState("")
  const [formMemo, setFormMemo] = useState("")

  // Computed totals from MC/TBS
  const formTotalQuestions = (parseInt(formMcQuestions) || 0) + (parseInt(formTbsQuestions) || 0)
  const formTotalCorrect = (parseInt(formMcCorrect) || 0) + (parseInt(formTbsCorrect) || 0)

  const filteredLogs = selectedSection === "ALL"
    ? logs
    : logs.filter(l => l.section === selectedSection)

  // Group logs by date
  const groupedLogs = filteredLogs.reduce<Record<string, StudyLog[]>>((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a))

  // Stats
  const totalLogs = filteredLogs.length
  const totalHours = filteredLogs.reduce((a, b) => a + b.studyHours, 0)
  const totalQuestions = filteredLogs.reduce((a, b) => a + b.questionsAnswered, 0)
  const uniqueDays = new Set(filteredLogs.map(l => l.date)).size

  const availableChapters = chapters.filter(c => c.section === formSection)

  // Weekly summaries
  const weeklySummaries = useMemo((): WeekSummary[] => {
    if (logs.length === 0) return []

    // Group logs by week (Mon-Sun)
    const weekMap = new Map<string, StudyLog[]>()
    for (const log of logs) {
      const d = new Date(log.date + "T00:00:00")
      const monday = getMonday(d)
      const key = monday.toISOString().split("T")[0]
      if (!weekMap.has(key)) weekMap.set(key, [])
      weekMap.get(key)!.push(log)
    }

    const weekKeys = [...weekMap.keys()].sort((a, b) => b.localeCompare(a))
    const summaries: WeekSummary[] = []

    for (let i = 0; i < weekKeys.length; i++) {
      const weekStart = weekKeys[i]
      const weekLogs = weekMap.get(weekStart)!
      const endDate = new Date(weekStart + "T00:00:00")
      endDate.setDate(endDate.getDate() + 6)

      const allSections: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP", "ISC"]
      const sections = {} as Record<ExamSection, { hours: number; mc: number; tbs: number; mcCorrect: number; tbsCorrect: number }>
      for (const s of allSections) {
        const sLogs = weekLogs.filter(l => l.section === s)
        sections[s] = {
          hours: sLogs.reduce((a, b) => a + b.studyHours, 0),
          mc: sLogs.reduce((a, b) => a + b.mcQuestions, 0),
          tbs: sLogs.reduce((a, b) => a + b.tbsQuestions, 0),
          mcCorrect: sLogs.reduce((a, b) => a + b.mcCorrect, 0),
          tbsCorrect: sLogs.reduce((a, b) => a + b.tbsCorrect, 0),
        }
      }

      const totalH = weekLogs.reduce((a, b) => a + b.studyHours, 0)
      const prevWeekLogs = i + 1 < weekKeys.length ? weekMap.get(weekKeys[i + 1])! : []
      const prevH = prevWeekLogs.reduce((a, b) => a + b.studyHours, 0)

      const comments = generateWeekComments(sections, totalH, prevH, t)

      summaries.push({
        weekLabel: `${formatWeekDate(weekStart, locale)} – ${formatWeekDate(endDate.toISOString().split("T")[0], locale)}`,
        startDate: weekStart,
        endDate: endDate.toISOString().split("T")[0],
        totalHours: totalH,
        prevWeekHours: prevH,
        sections,
        comments,
        logs: weekLogs,
      })
    }

    return summaries
  }, [logs, t, locale])

  const handleAddLog = useCallback(() => {
    if (!formChapterId || !formDate || !formHours) return
    const chapter = chapters.find(c => c.id === formChapterId)
    if (!chapter) return

    const mcQ = parseInt(formMcQuestions) || 0
    const mcC = parseInt(formMcCorrect) || 0
    const tbsQ = parseInt(formTbsQuestions) || 0
    const tbsC = parseInt(formTbsCorrect) || 0

    const newLog: StudyLog = {
      id: `log-${Date.now()}`,
      date: formDate,
      section: formSection,
      chapterId: formChapterId,
      chapterTitle: chapter.title,
      studyHours: parseFloat(formHours) || 0,
      mcQuestions: mcQ,
      mcCorrect: mcC,
      tbsQuestions: tbsQ,
      tbsCorrect: tbsC,
      questionsAnswered: mcQ + tbsQ,
      correctAnswers: mcC + tbsC,
      memo: formMemo.trim(),
    }

    setLogs([newLog, ...logs])
    setShowForm(false)
    setFormHours("")
    setFormMcQuestions("")
    setFormMcCorrect("")
    setFormTbsQuestions("")
    setFormTbsCorrect("")
    setFormMemo("")
  }, [formSection, formChapterId, formDate, formHours, formMcQuestions, formMcCorrect, formTbsQuestions, formTbsCorrect, formMemo, chapters])

  const handleDeleteLog = useCallback((id: string) => {
    setLogs(logs.filter(l => l.id !== id))
  }, [])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    const formatted = d.toLocaleDateString(locale === "es" ? "es" : "en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    if (diff === 0) return `${t("studyLog.today")} - ${formatted}`
    if (diff === 1) return `${t("studyLog.yesterday")} - ${formatted}`
    return formatted
  }

  const summaryItems = [
    { label: t("studyLog.totalSessions"), value: totalLogs.toString(), color: "hsl(225, 50%, 22%)" },
    { label: t("studyLog.studyDays"), value: uniqueDays.toString(), color: "hsl(175, 45%, 28%)" },
    { label: t("studyLog.totalHours"), value: `${totalHours.toFixed(1)}h`, color: "hsl(25, 55%, 35%)" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground">{t("studyLog.title")}</h2>
          <p className="text-muted-foreground mt-1">{t("studyLog.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("studyLog.newEntry")}
        </button>
      </div>

      {/* Summary Strip */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-border">
          {summaryItems.map((item) => (
            <div key={item.label} className="p-4 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
              <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Entry Form — MC/TBS split */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("studyLog.newStudyEntry")}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">{t("studyLog.date")}</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">{t("studyLog.section")}</label>
                <select
                  value={formSection}
                  onChange={(e) => { setFormSection(e.target.value as ExamSection); setFormChapterId("") }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {(["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).map(s => (
                    <option key={s} value={s}>{s} - {SECTION_INFO[s].fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">{t("studyLog.chapter")}</label>
              <select
                value={formChapterId}
                onChange={(e) => setFormChapterId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">{t("studyLog.selectChapter")}</option>
                {availableChapters.map(c => (
                  <option key={c.id} value={c.id}>Ch.{c.number} - {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">{t("studyLog.studyHours")}</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
                placeholder="e.g. 2.0"
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {/* MC / TBS split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("studyLog.mc")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{t("studyLog.questions")}</label>
                    <input
                      type="number"
                      min="0"
                      value={formMcQuestions}
                      onChange={(e) => setFormMcQuestions(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{t("studyLog.correct")}</label>
                    <input
                      type="number"
                      min="0"
                      value={formMcCorrect}
                      onChange={(e) => setFormMcCorrect(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("studyLog.tbs")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{t("studyLog.questions")}</label>
                    <input
                      type="number"
                      min="0"
                      value={formTbsQuestions}
                      onChange={(e) => setFormTbsQuestions(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">{t("studyLog.correct")}</label>
                    <input
                      type="number"
                      min="0"
                      value={formTbsCorrect}
                      onChange={(e) => setFormTbsCorrect(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Auto-computed total */}
            {formTotalQuestions > 0 && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                <span>{t("studyLog.total")}: {formTotalQuestions} {t("studyLog.questionsTotal")}, {formTotalCorrect} {t("studyLog.correctTotal")}</span>
                {formTotalQuestions > 0 && (
                  <span className="font-medium">({Math.round((formTotalCorrect / formTotalQuestions) * 100)}% {t("studyLog.accuracy")})</span>
                )}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">{t("studyLog.memoNotes")}</label>
              <textarea
                value={formMemo}
                onChange={(e) => setFormMemo(e.target.value)}
                placeholder={t("studyLog.memoPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-vertical"
              />
            </div>
            <button
              onClick={handleAddLog}
              disabled={!formChapterId || !formDate || !formHours}
              className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("studyLog.addEntry")}
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <StudyCharts logs={logs} locale={locale} />

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
          {t("studyLog.allSections")}
        </button>
        {(["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).map(section => (
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

      {/* Weekly Summaries */}
      {weeklySummaries.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">{t("studyLog.weeklySummary")}</h3>
          {weeklySummaries.map((week) => {
            const isWeekExpanded = expandedWeek === week.startDate
            const activeSections = (["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).filter(
              s => week.sections[s].hours > 0 || week.sections[s].mc > 0 || week.sections[s].tbs > 0
            )

            // Group week logs by date for daily drill-down
            const dayMap: Record<string, StudyLog[]> = {}
            for (const log of week.logs) {
              if (!dayMap[log.date]) dayMap[log.date] = []
              dayMap[log.date].push(log)
            }
            const weekDates = Object.keys(dayMap).sort()

            return (
              <div key={week.startDate} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedWeek(isWeekExpanded ? null : week.startDate)}
                  className="w-full px-5 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-card-foreground">{week.weekLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{week.totalHours.toFixed(1)}{t("studyLog.hTotal")}</span>
                      {week.prevWeekHours > 0 && (
                        <span className="flex items-center gap-1">
                          {week.totalHours >= week.prevWeekHours ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          vs {week.prevWeekHours.toFixed(1)}h {t("studyLog.vsPrev")}
                        </span>
                      )}
                      {isWeekExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {isWeekExpanded && (
                  <div className="border-t border-border">
                    <div className="px-5 py-4 space-y-3">
                      {/* Per-section breakdown - only active sections */}
                      <div className="space-y-2">
                        {activeSections.map((section) => {
                          const s = week.sections[section]
                          const maxHours = Math.max(...activeSections.map(sec => week.sections[sec].hours), 1)
                          const barWidth = (s.hours / maxHours) * 100
                          const total = s.mc + s.tbs
                          const mcTotal = total > 0 ? Math.round((s.mc / total) * 100) : 0
                          return (
                            <div key={section} className="flex items-center gap-3">
                              <span className="text-xs font-bold w-8 text-muted-foreground flex-shrink-0">{section}</span>
                              <div className="flex-1 min-w-0 h-4 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${barWidth}%`, backgroundColor: SECTION_INFO[section].color }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground min-w-fit text-right">{s.hours.toFixed(1)}h</span>
                              {total > 0 && (
                                <span className="text-xs text-muted-foreground min-w-fit text-right hidden sm:inline">MC:{mcTotal}% TBS:{100 - mcTotal}%</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {/* Auto-generated comments */}
                      {week.comments.length > 0 && (
                        <div className="pt-2 border-t border-border space-y-1.5">
                          {week.comments.map((comment, idx) => {
                            const isWarning = comment.includes("MC (") || comment.includes("TBS (") || comment.includes(t("studyLog.weekComment.hoursDown").split("{n}")[0] as string)
                            const isGood = comment.includes(t("studyLog.weekComment.goodBalance") as string) || comment.includes(t("studyLog.weekComment.hoursUp").split("{n}")[0] as string)
                            return (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                {isWarning ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                ) : isGood ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <span className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                <span className={cn(
                                  isWarning ? "text-amber-700 dark:text-amber-400" : isGood ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
                                )}>
                                  {comment}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Daily breakdown */}
                    <div className="border-t border-border">
                      {weekDates.map((date) => {
                        const dayLogs = dayMap[date]
                        const dayHours = dayLogs.reduce((a, b) => a + b.studyHours, 0)
                        const d = new Date(date + "T00:00:00")
                        const dayLabel = d.toLocaleDateString(locale === "es" ? "es" : "en-US", { weekday: "short", month: "short", day: "numeric" })
                        return (
                          <div key={date} className="px-5 py-3 border-b border-border last:border-b-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-semibold text-card-foreground">{dayLabel}</span>
                              <span className="text-[10px] text-muted-foreground">{dayHours.toFixed(1)}h / {dayLogs.length} {dayLogs.length > 1 ? t("studyLog.sessions") : t("studyLog.session")}</span>
                            </div>
                            <div className="space-y-1.5 pl-2">
                              {dayLogs.map((log) => (
                                <div key={log.id} className="flex items-center gap-2 text-xs">
                                  <div
                                    className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: SECTION_INFO[log.section].color }}
                                  >
                                    {log.section.charAt(0)}
                                  </div>
                                  <span className="text-card-foreground truncate">{log.chapterTitle}</span>
                                  <span className="text-muted-foreground ml-auto flex-shrink-0">{log.studyHours}h</span>
                                  {log.questionsAnswered > 0 && (
                                    <span className="text-muted-foreground flex-shrink-0">{log.correctAnswers}/{log.questionsAnswered}Q</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Logs grouped by date */}
      {sortedDates.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("studyLog.noLogs")}</p>
        </div>
      )}

      {sortedDates.map((date) => {
        const dayLogs = groupedLogs[date]
        const dayHours = dayLogs.reduce((a, b) => a + b.studyHours, 0)
        const dayQuestions = dayLogs.reduce((a, b) => a + b.questionsAnswered, 0)
        const isExpanded = expandedDate === null || expandedDate === date

        return (
          <div key={date} className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Day Header */}
            <button
              onClick={() => setExpandedDate(expandedDate === date ? null : date)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-card-foreground">{formatDate(date)}</p>
                  <p className="text-xs text-muted-foreground">{dayLogs.length} {dayLogs.length > 1 ? t("studyLog.sessions") : t("studyLog.session")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dayHours.toFixed(1)}h</span>
                  <span className="hidden sm:flex items-center gap-1"><BookOpen className="w-3 h-3" />{dayQuestions} Q</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {/* Day Logs */}
            {isExpanded && (
              <div className="border-t border-border">
                {dayLogs.map((log, idx) => {
                  const info = SECTION_INFO[log.section]
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "px-5 py-4 flex items-start gap-4 relative group",
                        idx < dayLogs.length - 1 && "border-b border-border"
                      )}
                    >
                      {/* Section badge */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-[hsl(0,0%,100%)] flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      >
                        {log.section}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-card-foreground">{log.chapterTitle}</p>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ch.{chapters.find(c => c.id === log.chapterId)?.number}</span>
                        </div>

                        {/* Stats row with MC/TBS breakdown */}
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />{log.studyHours}h
                          </span>
                          {log.mcQuestions > 0 && (
                            <span className="text-xs text-muted-foreground">
                              MC: {log.mcCorrect}/{log.mcQuestions}
                            </span>
                          )}
                          {log.tbsQuestions > 0 && (
                            <span className="text-xs text-muted-foreground">
                              TBS: {log.tbsCorrect}/{log.tbsQuestions}
                            </span>
                          )}
                        </div>

                        {/* Memo */}
                        {log.memo && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/30 rounded-lg px-3 py-2 border border-border">
                            {log.memo}
                          </p>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                        aria-label="Delete log entry"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
