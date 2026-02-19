"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Clock, Target, BookOpen, Plus, Calendar, ClipboardList } from "lucide-react"
import { SECTION_INFO, type Chapter, type StudyLog, type EssenceNote } from "@/lib/study-data"
import { EssenceNotes } from "@/components/essence-notes"

interface ChapterDetailViewProps {
  chapter: Chapter
  onBack: () => void
  studyLogs: StudyLog[]
  onAddLog: (log: StudyLog) => void
  essenceNotes: EssenceNote[]
  onAddNote: (note: EssenceNote) => void
  onRemoveNote: (noteId: string) => void
}

export function ChapterDetailView({
  chapter,
  onBack,
  studyLogs,
  onAddLog,
  essenceNotes,
  onAddNote,
  onRemoveNote,
}: ChapterDetailViewProps) {
  const [showLogForm, setShowLogForm] = useState(false)
  // Avoid hydration mismatch: initialize empty, set on client
  const [logDate, setLogDate] = useState("")
  const [logHours, setLogHours] = useState("")
  const [logMcQuestions, setLogMcQuestions] = useState("")
  const [logMcCorrect, setLogMcCorrect] = useState("")
  const [logTbsQuestions, setLogTbsQuestions] = useState("")
  const [logTbsCorrect, setLogTbsCorrect] = useState("")
  const [logMemo, setLogMemo] = useState("")

  useEffect(() => {
    setLogDate(new Date().toISOString().split("T")[0])
  }, [])

  const info = SECTION_INFO[chapter.section]
  const chapterLogs = studyLogs.filter(l => l.chapterId === chapter.id)
  const totalHours = chapterLogs.reduce((a, b) => a + b.studyHours, 0)
  const totalQuestions = chapterLogs.reduce((a, b) => a + b.questionsAnswered, 0)
  const totalCorrect = chapterLogs.reduce((a, b) => a + b.correctAnswers, 0)
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const logTotalQuestions = (parseInt(logMcQuestions) || 0) + (parseInt(logTbsQuestions) || 0)
  const logTotalCorrect = (parseInt(logMcCorrect) || 0) + (parseInt(logTbsCorrect) || 0)

  function handleAddLog() {
    if (!logDate || !logHours) return
    const mcQ = parseInt(logMcQuestions) || 0
    const mcC = parseInt(logMcCorrect) || 0
    const tbsQ = parseInt(logTbsQuestions) || 0
    const tbsC = parseInt(logTbsCorrect) || 0
    onAddLog({
      id: `log-${Date.now()}`,
      date: logDate,
      section: chapter.section,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      studyHours: parseFloat(logHours) || 0,
      mcQuestions: mcQ,
      mcCorrect: mcC,
      tbsQuestions: tbsQ,
      tbsCorrect: tbsC,
      questionsAnswered: mcQ + tbsQ,
      correctAnswers: mcC + tbsC,
      memo: logMemo.trim(),
    })
    setShowLogForm(false)
    setLogHours("")
    setLogMcQuestions("")
    setLogMcCorrect("")
    setLogTbsQuestions("")
    setLogTbsCorrect("")
    setLogMemo("")
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const statItems = [
    { label: "Sessions", value: chapterLogs.length.toString() },
    { label: "Study Time", value: `${totalHours.toFixed(1)}h` },
    { label: "Questions", value: totalQuestions.toString() },
    { label: "Accuracy", value: `${accuracy}%`, showBar: true },
  ]

  return (
    <div className="space-y-8">
      {/* Back Button + Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chapters
        </button>
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold text-[hsl(0,0%,100%)] flex-shrink-0"
            style={{ backgroundColor: info.color }}
          >
            {chapter.section}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chapter {chapter.number}</p>
            <h2 className="font-serif text-2xl text-foreground text-balance">{chapter.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{info.fullName}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="h-1" style={{ backgroundColor: info.color }} />
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {statItems.map((item) => (
            <div key={item.label} className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground capitalize">{item.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{item.label}</p>
              {item.showBar && totalQuestions > 0 && (
                <div className="w-16 h-1 mx-auto mt-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${accuracy}%`, backgroundColor: info.color }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Study Log */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${info.color}20` }}>
                <ClipboardList className="w-3.5 h-3.5" style={{ color: info.color }} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study Log</h3>
              <span className="ml-auto text-[10px] font-bold text-[hsl(0,0%,100%)] px-2 py-0.5 rounded-full" style={{ backgroundColor: info.color }}>
                {chapterLogs.length}
              </span>
              <button
                type="button"
                onClick={() => setShowLogForm(!showLogForm)}
                className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[hsl(0,0%,100%)] hover:opacity-90 transition-all flex items-center gap-1"
                style={{ backgroundColor: info.color }}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            {showLogForm && (
              <div className="p-5 border-b border-border bg-muted/10 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Date</label>
                    <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Hours</label>
                    <input type="number" step="0.5" min="0" value={logHours} onChange={(e) => setLogHours(e.target.value)} placeholder="e.g. 2.0" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MC (Multiple Choice)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Questions</label>
                      <input type="number" min="0" value={logMcQuestions} onChange={(e) => setLogMcQuestions(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Correct</label>
                      <input type="number" min="0" value={logMcCorrect} onChange={(e) => setLogMcCorrect(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TBS (Task-Based Simulations)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Questions</label>
                      <input type="number" min="0" value={logTbsQuestions} onChange={(e) => setLogTbsQuestions(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Correct</label>
                      <input type="number" min="0" value={logTbsCorrect} onChange={(e) => setLogTbsCorrect(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                  </div>
                </div>
                {logTotalQuestions > 0 && (
                  <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5">
                    Total: {logTotalQuestions} questions, {logTotalCorrect} correct ({logTotalQuestions > 0 ? Math.round((logTotalCorrect / logTotalQuestions) * 100) : 0}%)
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">Memo</label>
                  <textarea value={logMemo} onChange={(e) => setLogMemo(e.target.value)} placeholder="What did you study today?" rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-vertical" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddLog} disabled={!logDate || !logHours} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(0,0%,100%)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: info.color }}>
                    Record Session
                  </button>
                  <button type="button" onClick={() => setShowLogForm(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-border">
              {chapterLogs.length === 0 && (
                <div className="p-8 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No study sessions recorded yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Click &quot;Add&quot; to record your first session.</p>
                </div>
              )}
              {chapterLogs
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log) => {
                  const logAcc = log.questionsAnswered > 0 ? Math.round((log.correctAnswers / log.questionsAnswered) * 100) : 0
                  return (
                    <div key={log.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-card-foreground">{formatDate(log.date)}</span>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.studyHours}h</span>
                          {log.mcQuestions > 0 && (
                            <span>MC: {log.mcCorrect}/{log.mcQuestions}</span>
                          )}
                          {log.tbsQuestions > 0 && (
                            <span>TBS: {log.tbsCorrect}/{log.tbsQuestions}</span>
                          )}
                          {log.questionsAnswered > 0 && (
                            <span className="flex items-center gap-1" style={{ color: logAcc >= 75 ? info.color : logAcc >= 50 ? "hsl(230, 8%, 46%)" : "hsl(0, 72%, 51%)" }}>
                              <Target className="w-3 h-3" />{logAcc}%
                            </span>
                          )}
                        </div>
                      </div>
                      {log.memo && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{log.memo}</p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Essence Notes */}
        <div className="space-y-6">
          <EssenceNotes
            chapterId={chapter.id}
            notes={essenceNotes}
            onAddNote={onAddNote}
            onRemoveNote={onRemoveNote}
            accentColor={info.color}
          />
        </div>
      </div>
    </div>
  )
}
