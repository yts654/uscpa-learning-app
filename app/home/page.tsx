"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { DashboardView } from "@/components/dashboard-view"
import { ChaptersView } from "@/components/chapters-view"
import { ChapterDetailView } from "@/components/chapter-detail-view"
import { StudyLogView } from "@/components/study-log-view"
import { AnalyticsView } from "@/components/analytics-view"
import { SettingsView } from "@/components/settings-view"
import { ReviewView } from "@/components/review-view"
import { MockExamsView } from "@/components/mock-exams-view"
import { OnboardingTour } from "@/components/onboarding-tour"
import {
  INITIAL_PROGRESS, CHAPTERS, STUDY_LOGS, INITIAL_ESSENCE_NOTES, INITIAL_MOCK_EXAMS,
  DEFAULT_STUDY_GOALS, INITIAL_RECALL_RECORDS,
  type Chapter, type StudyLog, type ExamSection, type EssenceNote, type MockExam,
  type StudyGoals, type RecallRecord, type RecallRating,
} from "@/lib/study-data"
import { computeAllChapterRetentions } from "@/lib/spaced-repetition"
import { LanguageProvider, useLanguage } from "@/lib/i18n"
import { useNotifications } from "@/hooks/use-notifications"

function NotificationRunner({ chapterRetentions, streak, studyLogs }: {
  chapterRetentions: import("@/lib/spaced-repetition").ChapterRetention[]
  streak: number
  studyLogs: StudyLog[]
}) {
  const { t } = useLanguage()
  useNotifications(chapterRetentions, streak, studyLogs, t)
  return null
}

type View = "dashboard" | "chapters" | "study-log" | "mock-exams" | "analytics" | "settings" | "review"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [progress] = useState(INITIAL_PROGRESS)
  const [chapters] = useState<Chapter[]>(CHAPTERS)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(STUDY_LOGS)
  const [essenceNotes, setEssenceNotes] = useState<EssenceNote[]>(INITIAL_ESSENCE_NOTES)
  const { data: session } = useSession()
  const [profile, setProfile] = useState({ name: "Unknown", email: "user@example.com", photoUrl: null as string | null })

  // Sync session data to profile
  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }))
    }
  }, [session])
  const [mockExams, setMockExams] = useState<MockExam[]>(INITIAL_MOCK_EXAMS)
  const [completedSections, setCompletedSections] = useState<ExamSection[]>([])
  const [studyGoals, setStudyGoals] = useState<StudyGoals>(DEFAULT_STUDY_GOALS)
  const [recallRecords, setRecallRecords] = useState<RecallRecord[]>(INITIAL_RECALL_RECORDS)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tourActive, setTourActive] = useState(false)

  const handleSelectChapter = useCallback((chapter: Chapter) => {
    setSelectedChapter(chapter)
  }, [])

  const handleBackToChapters = useCallback(() => {
    setSelectedChapter(null)
  }, [])

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view)
    setSelectedChapter(null)
  }, [])

  const handleAddNote = useCallback((note: EssenceNote) => {
    setEssenceNotes(prev => [...prev, note])
  }, [])

  const handleRemoveNote = useCallback((noteId: string) => {
    setEssenceNotes(prev => prev.filter(n => n.id !== noteId))
  }, [])

  // Calculate chapter retentions (spaced repetition)
  const chapterRetentions = useMemo(() => {
    return computeAllChapterRetentions(chapters, studyLogs)
  }, [chapters, studyLogs])

  // Handle recall rating from Review tab
  const handleRecallRating = useCallback((chapterId: string, rating: RecallRating) => {
    const retention = chapterRetentions.find(r => r.chapterId === chapterId)
    const predictedRetention = retention ? retention.retention : 50
    const today = new Date().toISOString().split("T")[0]
    setRecallRecords(prev => [...prev, { chapterId, date: today, rating, predictedRetention }])
  }, [chapterRetentions])

  // Calculate study streak
  const streak = useMemo(() => {
    const uniqueDates = [...new Set(studyLogs.map(l => l.date))].sort((a, b) => b.localeCompare(a))
    if (uniqueDates.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let count = 0
    let checkDate = new Date(today)

    const latestLog = new Date(uniqueDates[0] + "T00:00:00")
    const diffFromToday = Math.floor((today.getTime() - latestLog.getTime()) / (1000 * 60 * 60 * 24))
    if (diffFromToday > 1) return 0
    if (diffFromToday === 1) {
      checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - 1)
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0]
      if (uniqueDates.includes(dateStr)) {
        count++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [studyLogs])

  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar currentView={currentView} onViewChange={handleViewChange} streak={streak} profile={profile} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(prev => !prev)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <MobileHeader currentView={currentView} onViewChange={handleViewChange} />
          <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-6xl w-full mx-auto overflow-x-hidden">
            {currentView === "dashboard" && (
              <DashboardView progress={progress} chapters={chapters} onViewChange={handleViewChange} completedSections={completedSections} studyLogs={studyLogs} essenceNotes={essenceNotes} streak={streak} chapterRetentions={chapterRetentions} onStartTour={() => setTourActive(true)} />
            )}
            {currentView === "chapters" && !selectedChapter && (
              <ChaptersView chapters={chapters} onSelectChapter={handleSelectChapter} studyLogs={studyLogs} completedSections={completedSections} chapterRetentions={chapterRetentions} />
            )}
            {currentView === "chapters" && selectedChapter && (
              <ChapterDetailView
                key={selectedChapter.id}
                chapter={selectedChapter}
                onBack={handleBackToChapters}
                studyLogs={studyLogs}
                onAddLog={(log) => setStudyLogs(prev => [log, ...prev])}
                essenceNotes={essenceNotes.filter(n => n.chapterId === selectedChapter.id)}
                onAddNote={handleAddNote}
                onRemoveNote={handleRemoveNote}
              />
            )}
            {currentView === "study-log" && <StudyLogView chapters={chapters} studyLogs={studyLogs} onUpdateLogs={setStudyLogs} studyGoals={studyGoals} onViewChange={handleViewChange} />}
            {currentView === "mock-exams" && <MockExamsView mockExams={mockExams} onUpdateMockExams={setMockExams} />}
            {currentView === "analytics" && (
              <AnalyticsView
                chapters={chapters}
                studyLogs={studyLogs}
                chapterRetentions={chapterRetentions}
                studyGoals={studyGoals}
                mockExams={mockExams}
                completedSections={completedSections}
                recallRecords={recallRecords}
              />
            )}
            {currentView === "review" && (
              <ReviewView
                chapterRetentions={chapterRetentions}
                chapters={chapters}
                onSelectChapter={handleSelectChapter}
                onViewChange={handleViewChange}
                onRecallRating={handleRecallRating}
              />
            )}
            {currentView === "settings" && (
              <SettingsView
                profile={profile}
                onUpdateProfile={setProfile}
                completedSections={completedSections}
                onUpdateCompletedSections={setCompletedSections}
                studyGoals={studyGoals}
                onUpdateStudyGoals={setStudyGoals}
              />
            )}
          </main>
          <footer className="lg:hidden py-4 text-center text-[10px] text-muted-foreground">
            &copy; 2026 CPA Mastery
          </footer>
        </div>
      </div>
      <OnboardingTour onViewChange={handleViewChange} externalStart={tourActive} onTourEnd={() => setTourActive(false)} />
      <NotificationRunner chapterRetentions={chapterRetentions} streak={streak} studyLogs={studyLogs} />
    </LanguageProvider>
  )
}
