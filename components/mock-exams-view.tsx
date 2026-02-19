"use client"

import { useState, useMemo } from "react"
import { Plus, FileText, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SECTION_INFO, type ExamSection, type MockExam } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface MockExamsViewProps {
  mockExams: MockExam[]
  onUpdateMockExams: (exams: MockExam[]) => void
}

const ALL_SECTIONS: ExamSection[] = ["FAR", "AUD", "REG", "BEC", "TCP"]

export function MockExamsView({ mockExams, onUpdateMockExams }: MockExamsViewProps) {
  const { t } = useLanguage()
  const [selectedSection, setSelectedSection] = useState<ExamSection | "ALL">("ALL")
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formSection, setFormSection] = useState<ExamSection>("FAR")
  const [formSource, setFormSource] = useState("")
  const [formMcQuestions, setFormMcQuestions] = useState("")
  const [formMcCorrect, setFormMcCorrect] = useState("")
  const [formTbsQuestions, setFormTbsQuestions] = useState("")
  const [formTbsCorrect, setFormTbsCorrect] = useState("")
  const [formMemo, setFormMemo] = useState("")
  const [formError, setFormError] = useState("")

  const mcQ = parseInt(formMcQuestions) || 0
  const mcC = parseInt(formMcCorrect) || 0
  const tbsQ = parseInt(formTbsQuestions) || 0
  const tbsC = parseInt(formTbsCorrect) || 0
  const formTotal = mcQ + tbsQ
  const formTotalCorrect = mcC + tbsC
  const formAccuracy = formTotal > 0 ? Math.round((formTotalCorrect / formTotal) * 1000) / 10 : 0

  // Summary per section
  const sectionSummaries = useMemo(() => {
    const summaries: Record<ExamSection, { best: number; latest: number; attempts: number }> = {} as never
    for (const section of ALL_SECTIONS) {
      const exams = mockExams.filter(e => e.section === section).sort((a, b) => a.date.localeCompare(b.date))
      if (exams.length === 0) {
        summaries[section] = { best: -1, latest: -1, attempts: 0 }
      } else {
        summaries[section] = {
          best: Math.max(...exams.map(e => e.accuracy)),
          latest: exams[exams.length - 1].accuracy,
          attempts: exams.length,
        }
      }
    }
    return summaries
  }, [mockExams])

  // Chart data — one data point per exam date, each section as a line
  const chartData = useMemo(() => {
    const filtered = selectedSection === "ALL" ? mockExams : mockExams.filter(e => e.section === selectedSection)
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date))

    return sorted.map(e => ({
      date: e.date,
      label: `${e.date} (${e.section})`,
      section: e.section,
      accuracy: e.accuracy,
      [e.section]: e.accuracy,
    }))
  }, [mockExams, selectedSection])

  // Build per-section line data for the chart
  const chartLines = useMemo(() => {
    const sectionsInData = selectedSection === "ALL"
      ? ALL_SECTIONS.filter(s => mockExams.some(e => e.section === s))
      : [selectedSection as ExamSection]

    // Build merged timeline data
    const dateSet = new Set<string>()
    const sectionExams: Record<string, MockExam[]> = {}
    for (const s of sectionsInData) {
      sectionExams[s] = mockExams.filter(e => e.section === s).sort((a, b) => a.date.localeCompare(b.date))
      sectionExams[s].forEach(e => dateSet.add(e.date))
    }

    const dates = [...dateSet].sort()
    const data = dates.map(date => {
      const point: Record<string, string | number | undefined> = { date }
      for (const s of sectionsInData) {
        const exam = sectionExams[s].find(e => e.date === date)
        point[s] = exam ? exam.accuracy : undefined
      }
      return point
    })

    return { data, sections: sectionsInData }
  }, [mockExams, selectedSection])

  // Filtered results
  const filteredExams = useMemo(() => {
    const exams = selectedSection === "ALL" ? mockExams : mockExams.filter(e => e.section === selectedSection)
    return [...exams].sort((a, b) => b.date.localeCompare(a.date))
  }, [mockExams, selectedSection])

  // Group by section for display
  const groupedExams = useMemo(() => {
    const groups: Record<string, MockExam[]> = {}
    for (const exam of filteredExams) {
      if (!groups[exam.section]) groups[exam.section] = []
      groups[exam.section].push(exam)
    }
    return groups
  }, [filteredExams])

  const handleSubmit = () => {
    setFormError("")
    if (mcC > mcQ) {
      setFormError(t("mockExams.form.validationError"))
      return
    }
    if (tbsC > tbsQ) {
      setFormError(t("mockExams.form.validationError"))
      return
    }
    if (formTotal === 0) return

    const newExam: MockExam = {
      id: `mock-${Date.now()}`,
      date: formDate,
      section: formSection,
      source: formSource,
      mcQuestions: mcQ,
      mcCorrect: mcC,
      tbsQuestions: tbsQ,
      tbsCorrect: tbsC,
      totalQuestions: formTotal,
      totalCorrect: formTotalCorrect,
      accuracy: formAccuracy,
      memo: formMemo,
    }

    onUpdateMockExams([...mockExams, newExam])
    // Reset form
    setFormDate(new Date().toISOString().split("T")[0])
    setFormSection("FAR")
    setFormSource("")
    setFormMcQuestions("")
    setFormMcCorrect("")
    setFormTbsQuestions("")
    setFormTbsCorrect("")
    setFormMemo("")
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    onUpdateMockExams(mockExams.filter(e => e.id !== id))
  }

  const getAccuracyColor = (accuracy: number, section: ExamSection) => {
    if (accuracy >= 75) return SECTION_INFO[section].color
    if (accuracy >= 50) return "hsl(230 15% 50%)"
    return "hsl(0 65% 50%)"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("mockExams.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("mockExams.subtitle")}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? t("mockExams.form.cancel") : t("mockExams.form.addResult")}
        </button>
      </div>

      {/* Summary Cards — 5 column grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ALL_SECTIONS.map(section => {
          const summary = sectionSummaries[section]
          return (
            <div key={section} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SECTION_INFO[section].color }}
                />
                <span className="text-sm font-semibold text-foreground">{section}</span>
              </div>
              {summary.attempts > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t("mockExams.summary.bestScore")}</span>
                    <span className="font-semibold" style={{ color: getAccuracyColor(summary.best, section) }}>
                      {summary.best.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t("mockExams.summary.latestScore")}</span>
                    <span className="font-semibold" style={{ color: getAccuracyColor(summary.latest, section) }}>
                      {summary.latest.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t("mockExams.summary.attempts")}</span>
                    <span className="font-semibold text-foreground">{summary.attempts}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t("mockExams.summary.noData")}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Score Trend Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("mockExams.chart.title")}</h3>
        {chartLines.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartLines.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: string) => {
                  const d = new Date(v + "T00:00:00")
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                labelFormatter={(label: string) => {
                  const d = new Date(label + "T00:00:00")
                  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                }}
              />
              <Legend />
              {chartLines.sections.map(section => (
                <Line
                  key={section}
                  type="monotone"
                  dataKey={section}
                  stroke={SECTION_INFO[section].color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: SECTION_INFO[section].color }}
                  connectNulls
                  name={section}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-12">{t("mockExams.chart.noData")}</p>
        )}
      </div>

      {/* Section Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSection("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            selectedSection === "ALL"
              ? "bg-foreground text-background"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {t("mockExams.filter.all")}
        </button>
        {ALL_SECTIONS.map(section => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selectedSection === section
                ? "text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
            style={selectedSection === section ? { backgroundColor: SECTION_INFO[section].color } : undefined}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Add Form (toggle) */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">{t("mockExams.form.addResult")}</h3>

          {formError && (
            <div className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{formError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.date")}</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
            {/* Section */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.section")}</label>
              <select
                value={formSection}
                onChange={e => setFormSection(e.target.value as ExamSection)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              >
                {ALL_SECTIONS.map(s => (
                  <option key={s} value={s}>{s} — {SECTION_INFO[s].fullName}</option>
                ))}
              </select>
            </div>
            {/* Source */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.source")}</label>
              <input
                type="text"
                value={formSource}
                onChange={e => setFormSource(e.target.value)}
                placeholder={t("mockExams.form.sourcePlaceholder")}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* MC / TBS inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.mcQuestions")}</label>
              <input
                type="number"
                min="0"
                value={formMcQuestions}
                onChange={e => setFormMcQuestions(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.mcCorrect")}</label>
              <input
                type="number"
                min="0"
                value={formMcCorrect}
                onChange={e => setFormMcCorrect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.tbsQuestions")}</label>
              <input
                type="number"
                min="0"
                value={formTbsQuestions}
                onChange={e => setFormTbsQuestions(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.tbsCorrect")}</label>
              <input
                type="number"
                min="0"
                value={formTbsCorrect}
                onChange={e => setFormTbsCorrect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
          </div>

          {/* Computed totals */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              {t("mockExams.form.total")}: <span className="font-semibold text-foreground">{formTotalCorrect} / {formTotal}</span>
            </span>
            <span className="text-muted-foreground">
              {t("mockExams.form.accuracy")}: <span className="font-semibold text-foreground">{formAccuracy}%</span>
            </span>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">{t("mockExams.form.memo")}</label>
            <textarea
              value={formMemo}
              onChange={e => setFormMemo(e.target.value)}
              placeholder={t("mockExams.form.memoPlaceholder")}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={formTotal === 0 || !formSource}
              className="px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("mockExams.form.submit")}
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-foreground">{t("mockExams.results.title")}</h3>

        {filteredExams.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t("mockExams.results.empty")}</p>
          </div>
        ) : (
          Object.entries(groupedExams).map(([section, exams]) => (
            <div key={section} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SECTION_INFO[section as ExamSection].color }}
                />
                <span className="text-sm font-semibold text-foreground">{section}</span>
                <span className="text-xs text-muted-foreground">
                  — {SECTION_INFO[section as ExamSection].fullName}
                </span>
              </div>

              <div className="space-y-2">
                {exams.map(exam => (
                  <div
                    key={exam.id}
                    className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    {/* Date & Source */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{exam.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{exam.source}</span>
                      </div>
                      {exam.memo && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{exam.memo}</p>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-4 text-xs flex-shrink-0">
                      <div className="text-center">
                        <span className="text-muted-foreground">{t("mockExams.results.mc")}</span>
                        <p className="font-semibold text-foreground">{exam.mcCorrect}/{exam.mcQuestions}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground">{t("mockExams.results.tbs")}</span>
                        <p className="font-semibold text-foreground">{exam.tbsCorrect}/{exam.tbsQuestions}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground">{t("mockExams.form.accuracy")}</span>
                        <p
                          className="text-lg font-bold"
                          style={{ color: getAccuracyColor(exam.accuracy, exam.section) }}
                        >
                          {exam.accuracy.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="self-start sm:self-center p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
                      title={t("mockExams.results.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
