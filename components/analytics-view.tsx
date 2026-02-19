"use client"

import { type StudyProgress, type Chapter, SECTION_INFO, WEEKLY_STUDY_DATA, MONTHLY_PROGRESS_DATA, type ExamSection } from "@/lib/study-data"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadialBarChart, RadialBar, PolarAngleAxis, Cell,
} from "recharts"

interface AnalyticsViewProps {
  progress: StudyProgress[]
  chapters: Chapter[]
}

const SECTION_COLORS: Record<ExamSection, string> = {
  FAR: "hsl(225, 50%, 22%)",
  AUD: "hsl(175, 45%, 28%)",
  REG: "hsl(25, 55%, 35%)",
  BEC: "hsl(345, 40%, 32%)",
  TCP: "hsl(265, 40%, 35%)",
}

export function AnalyticsView({ progress, chapters }: AnalyticsViewProps) {
  const totalQuestions = chapters.reduce((a, b) => a + b.totalQuestions, 0)
  const totalCorrect = chapters.reduce((a, b) => a + b.correctAnswers, 0)
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const totalHours = chapters.reduce((a, b) => a + b.studyHours, 0)
  const completedChapters = chapters.filter(c => c.status === "completed").length
  const overallCompletion = Math.round((completedChapters / chapters.length) * 100)

  const sectionData = (["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map(section => {
    const sectionChapters = chapters.filter(c => c.section === section)
    const q = sectionChapters.reduce((a, b) => a + b.totalQuestions, 0)
    const c = sectionChapters.reduce((a, b) => a + b.correctAnswers, 0)
    return {
      section,
      accuracy: q > 0 ? Math.round((c / q) * 100) : 0,
      fill: SECTION_COLORS[section],
      chapters: sectionChapters.length,
      completed: sectionChapters.filter(ch => ch.status === "completed").length,
      hours: sectionChapters.reduce((a, b) => a + b.studyHours, 0),
      questions: q,
    }
  })

  const radialData = [{ name: "Progress", value: overallCompletion, fill: "hsl(225, 50%, 22%)" }]

  const topMetrics = [
    { label: "Chapters Done", value: `${overallCompletion}%`, color: SECTION_COLORS.FAR },
    { label: "Accuracy Rate", value: `${overallAccuracy}%`, color: SECTION_COLORS.AUD },
    { label: "Questions Done", value: totalQuestions.toString(), color: SECTION_COLORS.REG },
    { label: "Study Time", value: `${totalHours.toFixed(1)}h`, color: SECTION_COLORS.BEC },
    { label: "Day Streak", value: "12", color: "hsl(230, 25%, 8%)" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl text-foreground text-balance">Analytics</h2>
        <p className="text-muted-foreground mt-1">Detailed performance analysis across all exam sections and chapters.</p>
      </div>

      {/* Top metrics row */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exhibit 1: Overall Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-border">
          {topMetrics.map((m) => (
            <div key={m.label} className="p-5 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full" style={{ backgroundColor: m.color }} />
              <p className="text-3xl font-bold mt-1" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Trend */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exhibit 2: Score Progress by Section</h3>
            <p className="text-xs text-muted-foreground mt-1">Monthly accuracy trend (%) across all sections</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_PROGRESS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(230, 12%, 90%)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(230, 8%, 46%)" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(230, 8%, 46%)" }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(232, 47%, 8%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "11px",
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="far" stroke={SECTION_COLORS.FAR} strokeWidth={2.5} dot={{ r: 3, fill: SECTION_COLORS.FAR }} name="FAR" />
                <Line type="monotone" dataKey="aud" stroke={SECTION_COLORS.AUD} strokeWidth={2.5} dot={{ r: 3, fill: SECTION_COLORS.AUD }} name="AUD" />
                <Line type="monotone" dataKey="reg" stroke={SECTION_COLORS.REG} strokeWidth={2.5} dot={{ r: 3, fill: SECTION_COLORS.REG }} name="REG" />
                <Line type="monotone" dataKey="bec" stroke={SECTION_COLORS.BEC} strokeWidth={2.5} dot={{ r: 3, fill: SECTION_COLORS.BEC }} name="BEC" />
                <Line type="monotone" dataKey="tcp" stroke={SECTION_COLORS.TCP} strokeWidth={2.5} dot={{ r: 3, fill: SECTION_COLORS.TCP }} name="TCP" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Study Hours */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exhibit 3: Weekly Study Hours</h3>
            <p className="text-xs text-muted-foreground mt-1">Hours invested per day this week</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_STUDY_DATA} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(230, 12%, 90%)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(230, 8%, 46%)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(230, 8%, 46%)" }} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(232, 47%, 8%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "11px",
                  }}
                  cursor={{ fill: "hsl(230, 10%, 93%, 0.7)" }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} name="Hours">
                  {WEEKLY_STUDY_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(SECTION_COLORS)[index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section Breakdown Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exhibit 4: Section-by-Section Performance Breakdown</h3>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 px-6 py-3 border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-2">Section</div>
          <div className="text-center">Chapters</div>
          <div className="text-center">Completed</div>
          <div className="text-center">Accuracy</div>
          <div className="text-center">Questions</div>
          <div className="text-center">Study Hours</div>
        </div>

        {/* Table Rows */}
        {sectionData.map((s) => {
          const info = SECTION_INFO[s.section]
          return (
            <div key={s.section} className="grid grid-cols-7 px-6 py-4 border-b border-border last:border-b-0 items-center hover:bg-muted/20 transition-colors">
              <div className="col-span-2 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold text-[hsl(0,0%,100%)]"
                  style={{ backgroundColor: SECTION_COLORS[s.section] }}
                >
                  {s.section}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{info.fullName}</p>
                </div>
              </div>
              <div className="text-center text-sm text-card-foreground">{s.chapters}</div>
              <div className="text-center text-sm font-medium text-card-foreground">{s.completed}/{s.chapters}</div>
              <div className="text-center">
                <span className="text-sm font-bold" style={{ color: s.accuracy >= 70 ? SECTION_COLORS[s.section] : s.accuracy >= 50 ? "hsl(230, 8%, 46%)" : "hsl(0, 72%, 51%)" }}>
                  {s.accuracy}%
                </span>
              </div>
              <div className="text-center text-sm text-card-foreground">{s.questions}</div>
              <div className="text-center text-sm font-medium text-card-foreground">{s.hours.toFixed(1)}h</div>
            </div>
          )
        })}

        {/* Total Row */}
        <div className="grid grid-cols-7 px-6 py-4 bg-muted/30 items-center font-bold border-t-2 border-foreground/10">
          <div className="col-span-2 text-sm text-card-foreground">Total</div>
          <div className="text-center text-sm text-card-foreground">{chapters.length}</div>
          <div className="text-center text-sm text-card-foreground">{completedChapters}/{chapters.length}</div>
          <div className="text-center text-sm" style={{ color: SECTION_COLORS.FAR }}>{overallAccuracy}%</div>
          <div className="text-center text-sm text-card-foreground">{totalQuestions}</div>
          <div className="text-center text-sm text-card-foreground">{totalHours.toFixed(1)}h</div>
        </div>
      </div>

      {/* Bottom row charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exhibit 5: Section Accuracy Comparison</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(230, 12%, 90%)" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(230, 8%, 46%)" }} unit="%" />
                <YAxis type="category" dataKey="section" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "hsl(230, 25%, 8%)" }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(232, 47%, 8%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} name="Accuracy %">
                  {sectionData.map((entry) => (
                    <Cell key={entry.section} fill={SECTION_COLORS[entry.section]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Progress Radial */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exhibit 6: Overall Exam Readiness</h3>
          </div>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} fill="hsl(225, 50%, 22%)" />
                <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-3xl font-bold" dominantBaseline="middle">
                  {overallCompletion}%
                </text>
                <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs" dominantBaseline="middle">
                  Chapters Complete
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
