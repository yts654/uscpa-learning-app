"use client"

import { useState, useCallback, useMemo } from "react"
import { Plus, Filter, Calendar, Clock, Target, BookOpen, ChevronDown, ChevronUp, X, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SECTION_INFO, type ExamSection, type Chapter, type StudyLog } from "@/lib/study-data"

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
}

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatWeekDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function generateWeekComments(
  sections: Record<ExamSection, { hours: number; mc: number; tbs: number }>,
  totalHours: number,
  prevWeekHours: number
): string[] {
  const comments: string[] = []
  const allSections: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP"]

  for (const section of allSections) {
    const s = sections[section]
    if (s.hours === 0) {
      comments.push(`${section}: No study sessions this week`)
      continue
    }
    const total = s.mc + s.tbs
    if (total === 0) continue
    const mcRatio = s.mc / total
    if (mcRatio > 0.8) {
      comments.push(`${section}: Heavy on MC (${Math.round(mcRatio * 100)}%), consider more TBS practice`)
    } else if (mcRatio < 0.2) {
      comments.push(`${section}: Heavy on TBS (${Math.round((1 - mcRatio) * 100)}%), consider more MC practice`)
    } else {
      comments.push(`${section}: Good balance across MC/TBS`)
    }
  }

  if (prevWeekHours > 0 && totalHours > 0) {
    const change = ((totalHours - prevWeekHours) / prevWeekHours) * 100
    if (change <= -30) {
      comments.push(`Total hours down ${Math.abs(Math.round(change))}% vs last week`)
    } else if (change >= 30) {
      comments.push(`Total hours up ${Math.round(change)}% vs last week`)
    }
  }

  return comments
}

export function StudyLogView({ chapters, studyLogs, onUpdateLogs }: StudyLogViewProps) {
  const logs = studyLogs
  const setLogs = onUpdateLogs
  const [selectedSection, setSelectedSection] = useState<ExamSection | "ALL">("ALL")
  const [showForm, setShowForm] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

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
  const totalCorrect = filteredLogs.reduce((a, b) => a + b.correctAnswers, 0)
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
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

      const allSections: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP"]
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

      const comments = generateWeekComments(sections, totalH, prevH)

      summaries.push({
        weekLabel: `${formatWeekDate(weekStart)} – ${formatWeekDate(endDate.toISOString().split("T")[0])}`,
        startDate: weekStart,
        endDate: endDate.toISOString().split("T")[0],
        totalHours: totalH,
        prevWeekHours: prevH,
        sections,
        comments,
      })
    }

    return summaries
  }, [logs])

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
    const formatted = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    if (diff === 0) return `Today - ${formatted}`
    if (diff === 1) return `Yesterday - ${formatted}`
    return formatted
  }

  const summaryItems = [
    { label: "Total Sessions", value: totalLogs.toString(), color: "hsl(225, 50%, 22%)" },
    { label: "Study Days", value: uniqueDays.toString(), color: "hsl(175, 45%, 28%)" },
    { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, color: "hsl(25, 55%, 35%)" },
    { label: "Accuracy", value: `${accuracy}%`, color: "hsl(345, 40%, 32%)" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-foreground">Study Log</h2>
          <p className="text-muted-foreground mt-1">Record and track your daily study sessions by subject and chapter.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
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

      {/* New Entry Form — MC/TBS split */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Study Entry</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Section</label>
                <select
                  value={formSection}
                  onChange={(e) => { setFormSection(e.target.value as ExamSection); setFormChapterId("") }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {(["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map(s => (
                    <option key={s} value={s}>{s} - {SECTION_INFO[s].fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Chapter</label>
              <select
                value={formChapterId}
                onChange={(e) => setFormChapterId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">Select a chapter...</option>
                {availableChapters.map(c => (
                  <option key={c.id} value={c.id}>Ch.{c.number} - {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Study Hours</label>
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
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MC (Multiple Choice)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Questions</label>
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
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Correct</label>
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
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TBS (Task-Based Simulations)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Questions</label>
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
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Correct</label>
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
                <span>Total: {formTotalQuestions} questions, {formTotalCorrect} correct</span>
                {formTotalQuestions > 0 && (
                  <span className="font-medium">({Math.round((formTotalCorrect / formTotalQuestions) * 100)}% accuracy)</span>
                )}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Memo / Notes</label>
              <textarea
                value={formMemo}
                onChange={(e) => setFormMemo(e.target.value)}
                placeholder="What did you study? What needs more review?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-vertical"
              />
            </div>
            <button
              onClick={handleAddLog}
              disabled={!formChapterId || !formDate || !formHours}
              className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Study Log Entry
            </button>
          </div>
        </div>
      )}

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
          All Sections
        </button>
        {(["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map(section => (
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
          <h3 className="font-semibold text-foreground">Weekly Summary</h3>
          {weeklySummaries.map((week) => (
            <div key={week.startDate} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-card-foreground">{week.weekLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{week.totalHours.toFixed(1)}h total</span>
                    {week.prevWeekHours > 0 && (
                      <span className="flex items-center gap-1">
                        {week.totalHours >= week.prevWeekHours ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        vs {week.prevWeekHours.toFixed(1)}h prev
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {/* Per-section breakdown */}
                <div className="space-y-2">
                  {(["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map((section) => {
                    const s = week.sections[section]
                    if (s.hours === 0 && s.mc === 0 && s.tbs === 0) return null
                    const maxHours = Math.max(...Object.values(week.sections).map(x => x.hours), 1)
                    const barWidth = (s.hours / maxHours) * 100
                    const mcTotal = s.mc > 0 ? Math.round((s.mc / (s.mc + s.tbs)) * 100) : 0
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
                        <span className="text-xs text-muted-foreground min-w-fit text-right hidden sm:inline">MC:{mcTotal}% TBS:{100 - mcTotal}%</span>
                      </div>
                    )
                  })}
                </div>
                {/* Auto-generated comments */}
                {week.comments.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    {week.comments.map((comment, idx) => {
                      const isWarning = comment.includes("No study") || comment.includes("Heavy on") || comment.includes("down")
                      const isGood = comment.includes("Good balance") || comment.includes("up")
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
            </div>
          ))}
        </div>
      )}

      {/* Logs grouped by date */}
      {sortedDates.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No study logs yet. Click &quot;New Entry&quot; to start recording.</p>
        </div>
      )}

      {sortedDates.map((date) => {
        const dayLogs = groupedLogs[date]
        const dayHours = dayLogs.reduce((a, b) => a + b.studyHours, 0)
        const dayQuestions = dayLogs.reduce((a, b) => a + b.questionsAnswered, 0)
        const dayCorrect = dayLogs.reduce((a, b) => a + b.correctAnswers, 0)
        const dayAccuracy = dayQuestions > 0 ? Math.round((dayCorrect / dayQuestions) * 100) : 0
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
                  <p className="text-xs text-muted-foreground">{dayLogs.length} session{dayLogs.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dayHours.toFixed(1)}h</span>
                  <span className="hidden sm:flex items-center gap-1"><BookOpen className="w-3 h-3" />{dayQuestions} Q</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{dayAccuracy}%</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {/* Day Logs */}
            {isExpanded && (
              <div className="border-t border-border">
                {dayLogs.map((log, idx) => {
                  const info = SECTION_INFO[log.section]
                  const logAccuracy = log.questionsAnswered > 0 ? Math.round((log.correctAnswers / log.questionsAnswered) * 100) : 0

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
                          {log.questionsAnswered > 0 && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: logAccuracy >= 75 ? info.color : logAccuracy >= 50 ? "hsl(230, 8%, 46%)" : "hsl(0, 72%, 51%)" }}>
                              <Target className="w-3 h-3" />{logAccuracy}% accuracy
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
