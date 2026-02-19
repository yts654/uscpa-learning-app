"use client"

import { useState, useMemo } from "react"
import { Filter, ChevronRight, BookOpen, Clock, Target, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SECTION_INFO, type ExamSection, type Chapter, type StudyLog } from "@/lib/study-data"
import { type ChapterRetention, getMasteryLevelInfo, getRetentionColor } from "@/lib/spaced-repetition"

interface ChaptersViewProps {
  chapters: Chapter[]
  onSelectChapter: (chapter: Chapter) => void
  studyLogs: StudyLog[]
  completedSections?: ExamSection[]
  chapterRetentions?: ChapterRetention[]
}

export function ChaptersView({ chapters, onSelectChapter, studyLogs, completedSections = [], chapterRetentions = [] }: ChaptersViewProps) {
  const retentionMap = useMemo(() => {
    const m = new Map<string, ChapterRetention>()
    for (const r of chapterRetentions) m.set(r.chapterId, r)
    return m
  }, [chapterRetentions])

  const [selectedSection, setSelectedSection] = useState<ExamSection | "ALL">("ALL")

  const filteredChapters = selectedSection === "ALL"
    ? chapters
    : chapters.filter(c => c.section === selectedSection)

  const sectionGroups = filteredChapters.reduce<Record<string, Chapter[]>>((acc, ch) => {
    const key = ch.section
    if (!acc[key]) acc[key] = []
    acc[key].push(ch)
    return acc
  }, {})

  // Build a map of chapterId -> aggregated log stats
  const chapterLogStats = (chapterId: string) => {
    const logs = studyLogs.filter(l => l.chapterId === chapterId)
    const hours = logs.reduce((a, b) => a + b.studyHours, 0)
    const questions = logs.reduce((a, b) => a + b.questionsAnswered, 0)
    const correct = logs.reduce((a, b) => a + b.correctAnswers, 0)
    const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : 0
    return { hours, questions, correct, accuracy, sessions: logs.length }
  }

  const filteredLogs = selectedSection === "ALL"
    ? studyLogs
    : studyLogs.filter(l => l.section === selectedSection)
  const totalLogHours = filteredLogs.reduce((a, b) => a + b.studyHours, 0)
  const totalLogQuestions = filteredLogs.reduce((a, b) => a + b.questionsAnswered, 0)
  const totalLogCorrect = filteredLogs.reduce((a, b) => a + b.correctAnswers, 0)
  const totalLogAccuracy = totalLogQuestions > 0 ? Math.round((totalLogCorrect / totalLogQuestions) * 100) : 0

  const totalChapters = filteredChapters.length
  const studiedChapters = filteredChapters.filter(c => chapterLogStats(c.id).sessions > 0).length

  const summaryItems = [
    { label: "Total Chapters", value: totalChapters.toString(), color: "hsl(225, 50%, 22%)" },
    { label: "Studied", value: studiedChapters.toString(), color: "hsl(175, 45%, 28%)" },
    { label: "Total Study Time", value: `${totalLogHours.toFixed(1)}h`, color: "hsl(25, 55%, 35%)" },
    { label: "Overall Accuracy", value: `${totalLogAccuracy}%`, color: "hsl(345, 40%, 32%)" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl text-foreground text-balance">Chapters</h2>
        <p className="text-muted-foreground mt-1">Track your study progress by chapter. Click a chapter to view details and record study sessions.</p>
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

      {/* Chapter List grouped by section */}
      {Object.entries(sectionGroups).map(([section, sectionChapters]) => {
        const info = SECTION_INFO[section as ExamSection]
        const sectionLogs = studyLogs.filter(l => l.section === section)
        const sectionHours = sectionLogs.reduce((a, b) => a + b.studyHours, 0)
        const sectionQuestions = sectionLogs.reduce((a, b) => a + b.questionsAnswered, 0)
        const sectionCorrect = sectionLogs.reduce((a, b) => a + b.correctAnswers, 0)
        const sectionAccuracy = sectionQuestions > 0 ? Math.round((sectionCorrect / sectionQuestions) * 100) : 0

        const isSectionCompleted = completedSections.includes(section as ExamSection)

        return (
          <div key={section} className={isSectionCompleted ? "opacity-45" : ""}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-[hsl(0,0%,100%)]"
                style={{ backgroundColor: isSectionCompleted ? "hsl(0 0% 60%)" : info.color }}
              >
                {section}
              </div>
              <div className="flex-1">
                <h3 className={cn("text-sm font-semibold", isSectionCompleted ? "text-muted-foreground line-through" : "text-foreground")}>
                  {info.fullName}
                  {isSectionCompleted && <span className="ml-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 no-underline inline-block">Completed</span>}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {sectionChapters.length} chapters
                  {sectionHours > 0 && <span className="ml-1">/ {sectionHours.toFixed(1)}h studied</span>}
                  {sectionQuestions > 0 && <span className="ml-1">/ Accuracy: {sectionAccuracy}%</span>}
                </p>
              </div>
            </div>

            {/* Chapter Rows */}
            <div className="bg-card rounded-xl border border-border overflow-hidden mb-6">
              {sectionChapters.sort((a, b) => a.number - b.number).map((chapter, idx) => {
                const stats = chapterLogStats(chapter.id)
                const hasStudied = stats.sessions > 0

                return (
                  <button
                    key={chapter.id}
                    onClick={() => onSelectChapter(chapter)}
                    className={cn(
                      "w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors group relative",
                      idx < sectionChapters.length - 1 && "border-b border-border"
                    )}
                  >
                    {/* Colored left accent on hover */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: info.color }}
                    />

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {hasStudied ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: info.color }} />
                      ) : (
                        <Circle className="w-5 h-5 text-border" />
                      )}
                    </div>

                    {/* Chapter Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ch.{chapter.number}</span>
                        <h4 className="text-sm font-medium text-card-foreground truncate">{chapter.title}</h4>
                      </div>
                      {hasStudied && (
                        <div className="flex items-center gap-2 sm:gap-4 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{stats.hours.toFixed(1)}h</span>
                          </div>
                          {stats.questions > 0 && (
                            <>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <BookOpen className="w-3 h-3" />
                                <span>{stats.questions} Q</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="w-3 h-3" />
                                <span>{stats.accuracy}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Retention + Mastery */}
                    {(() => {
                      const ret = retentionMap.get(chapter.id)
                      if (!ret || ret.reviewCount === 0) return null
                      const masteryInfo = getMasteryLevelInfo(ret.masteryLevel)
                      const retColor = getRetentionColor(ret.retention)
                      return (
                        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-xs font-medium px-1.5 py-0.5 rounded"
                            style={{ color: masteryInfo.color, backgroundColor: masteryInfo.bgColor }}
                          >
                            {masteryInfo.label}
                          </span>
                          <div className="flex items-center gap-1 w-20">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${ret.retention}%`, backgroundColor: retColor }} />
                            </div>
                            <span className="text-xs font-medium w-8 text-right" style={{ color: retColor }}>{ret.retention}%</span>
                          </div>
                        </div>
                      )
                    })()}

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Bottom Summary: Study Hours by Chapter */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study Hours Summary by Chapter</h3>
        </div>

        {Object.entries(sectionGroups).map(([section, sectionChapters]) => {
          const info = SECTION_INFO[section as ExamSection]
          const sorted = [...sectionChapters].sort((a, b) => a.number - b.number)
          const sectionTotalHours = sorted.reduce((a, ch) => a + chapterLogStats(ch.id).hours, 0)

          if (sectionTotalHours === 0) return null

          return (
            <div key={section} className="border-b border-border last:border-b-0">
              {/* Section label */}
              <div className="px-6 py-3 bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-[hsl(0,0%,100%)]"
                    style={{ backgroundColor: info.color }}
                  >
                    {section}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{info.fullName}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{sectionTotalHours.toFixed(1)}h</span>
              </div>

              {/* Chapter rows */}
              {sorted.map((ch) => {
                const stats = chapterLogStats(ch.id)
                if (stats.sessions === 0) return null

                const maxHours = Math.max(...sorted.map(c => chapterLogStats(c.id).hours), 1)
                const barWidth = Math.round((stats.hours / maxHours) * 100)

                return (
                  <div key={ch.id} className="px-6 py-2.5 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground w-10 flex-shrink-0">Ch.{ch.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-card-foreground truncate">{ch.title}</p>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${barWidth}%`, backgroundColor: info.color }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-right">
                      <span className="text-xs font-bold text-foreground w-12">{stats.hours.toFixed(1)}h</span>
                      {stats.questions > 0 && (
                        <span className="text-xs text-muted-foreground w-14">{stats.accuracy}% acc</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Grand Total */}
        {totalLogHours > 0 && (
          <div className="px-6 py-4 bg-muted/30 flex items-center justify-between border-t-2 border-foreground/10">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Grand Total</span>
            <span className="text-lg font-bold text-foreground">{totalLogHours.toFixed(1)}<span className="text-xs font-normal text-muted-foreground">h</span></span>
          </div>
        )}
      </div>
    </div>
  )
}
