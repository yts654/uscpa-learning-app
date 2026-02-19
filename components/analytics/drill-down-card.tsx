"use client"

import { useState, useMemo } from "react"
import { type StudyLog, type ExamSection, SECTION_INFO } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { ChevronDown, BarChart3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

interface DrillDownCardProps {
  studyLogs: StudyLog[]
}

export function DrillDownCard({ studyLogs }: DrillDownCardProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)

  // Get chapters that have study data
  const studiedChapters = useMemo(() => {
    const map: Record<string, { id: string; section: ExamSection; title: string; number: number }> = {}
    studyLogs.forEach(l => {
      if (!map[l.chapterId]) {
        map[l.chapterId] = { id: l.chapterId, section: l.section, title: l.chapterTitle, number: parseInt(l.chapterId.split("-ch")[1]) || 0 }
      }
    })
    return Object.values(map).sort((a, b) => a.section.localeCompare(b.section) || a.number - b.number)
  }, [studyLogs])

  // Chart data for selected chapter
  const chartData = useMemo(() => {
    if (!selectedChapterId) return []
    const logs = studyLogs
      .filter(l => l.chapterId === selectedChapterId)
      .sort((a, b) => a.date.localeCompare(b.date))
    return logs.map((l, i) => ({
      session: i + 1,
      date: l.date,
      accuracy: l.questionsAnswered > 0 ? Math.round((l.correctAnswers / l.questionsAnswered) * 100) : 0,
      questions: l.questionsAnswered,
    }))
  }, [studyLogs, selectedChapterId])

  const selectedInfo = studiedChapters.find(c => c.id === selectedChapterId)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.drilldown.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("analytics.drilldown.subtitle")}</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-6 pb-5 border-t border-border pt-4">
          {/* Chapter selector */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {studiedChapters.map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapterId(ch.id === selectedChapterId ? null : ch.id)}
                className={cn(
                  "text-[10px] font-medium px-2 py-1 rounded border transition-all",
                  ch.id === selectedChapterId
                    ? "border-current shadow-sm"
                    : "border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground"
                )}
                style={ch.id === selectedChapterId ? { color: SECTION_INFO[ch.section].color, backgroundColor: SECTION_INFO[ch.section].color + "12" } : undefined}
              >
                {ch.section} Ch.{ch.number}
              </button>
            ))}
          </div>

          {selectedChapterId && chartData.length > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                {selectedInfo?.title}
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis
                      dataKey="session"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      label={{ value: t("analytics.drilldown.session"), position: "insideBottomRight", offset: -4, fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      unit="%"
                    />
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
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke={selectedInfo ? SECTION_INFO[selectedInfo.section].color : "hsl(225, 50%, 22%)"}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      name={t("analytics.drilldown.accuracy")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {t("analytics.drilldown.selectChapter")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
