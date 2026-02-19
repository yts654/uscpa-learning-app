import { type Chapter, type StudyLog, type ExamSection } from "@/lib/study-data"

// ── Types ──────────────────────────────────────────────────────────────
export type MasteryLevel = "new" | "learning" | "reviewing" | "mastered"

export interface ChapterRetention {
  chapterId: string
  section: ExamSection
  chapterTitle: string
  chapterNumber: number
  retention: number          // 0-100
  daysSinceLastStudy: number // -1 if never
  reviewCount: number        // distinct study dates
  masteryLevel: MasteryLevel
  nextReviewDate: string     // YYYY-MM-DD
  stability: number
  isOverdue: boolean         // retention < 30%
  isDueToday: boolean        // nextReviewDate <= today
  isComingUp: boolean        // due within 7 days
}

// ── Constants ──────────────────────────────────────────────────────────
const REVIEW_INTERVALS = [1, 3, 7, 14, 30] // days, by review count
const LN_HALF = Math.log(0.5) // ≈ -0.6931

// ── Core Calculation Functions ─────────────────────────────────────────

/** Calculate stability from review count. Higher = slower forgetting. */
export function calculateStability(reviewCount: number): number {
  if (reviewCount <= 0) return 1 // brand new — fast decay
  const idx = Math.min(reviewCount - 1, REVIEW_INTERVALS.length - 1)
  let interval: number
  if (idx < REVIEW_INTERVALS.length) {
    interval = REVIEW_INTERVALS[idx]
  } else {
    interval = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1] * Math.pow(2, reviewCount - REVIEW_INTERVALS.length)
  }
  // S such that R(interval) = 50%  →  e^(-interval/S) = 0.5  →  S = -interval / ln(0.5)
  return -interval / LN_HALF // ≈ interval / 0.6931
}

/** Ebbinghaus retention: R(t) = e^(-t/S), returned as 0-100. */
export function calculateRetention(daysSinceStudy: number, stability: number): number {
  if (daysSinceStudy <= 0) return 100
  if (stability <= 0) return 0
  const r = Math.exp(-daysSinceStudy / stability)
  return Math.round(r * 100)
}

/** Next review date = lastDate + interval for current review stage. */
export function calculateNextReviewDate(lastDate: string, reviewCount: number): string {
  const idx = Math.min(reviewCount - 1, REVIEW_INTERVALS.length - 1)
  let interval: number
  if (reviewCount <= 0) {
    interval = 0 // not studied yet — due now
  } else if (idx < REVIEW_INTERVALS.length) {
    interval = REVIEW_INTERVALS[idx]
  } else {
    interval = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1] * Math.pow(2, reviewCount - REVIEW_INTERVALS.length)
  }
  const d = new Date(lastDate + "T00:00:00")
  d.setDate(d.getDate() + interval)
  return d.toISOString().split("T")[0]
}

/** Determine mastery level from review count and retention. */
export function determineMasteryLevel(reviewCount: number, retention: number): MasteryLevel {
  if (reviewCount === 0) return "new"
  if (reviewCount <= 2) return "learning"
  if (reviewCount >= 5 && retention > 50) return "mastered"
  return "reviewing"
}

// ── Main Entry Point ───────────────────────────────────────────────────

/** Compute retention data for every chapter. */
export function computeAllChapterRetentions(
  chapters: Chapter[],
  studyLogs: StudyLog[],
): ChapterRetention[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]

  return chapters.map((ch) => {
    const logs = studyLogs.filter((l) => l.chapterId === ch.id)
    // Distinct study dates
    const distinctDates = [...new Set(logs.map((l) => l.date))].sort()
    const reviewCount = distinctDates.length

    const lastDate = distinctDates.length > 0 ? distinctDates[distinctDates.length - 1] : ""
    const daysSinceLastStudy = lastDate
      ? Math.floor((today.getTime() - new Date(lastDate + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))
      : -1

    const stability = calculateStability(reviewCount)
    const retention = daysSinceLastStudy >= 0 ? calculateRetention(daysSinceLastStudy, stability) : 0
    const masteryLevel = determineMasteryLevel(reviewCount, retention)

    const nextReviewDate = reviewCount > 0
      ? calculateNextReviewDate(lastDate, reviewCount)
      : todayStr // never studied → due today

    const nextReviewD = new Date(nextReviewDate + "T00:00:00")
    const daysUntilReview = Math.floor((nextReviewD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      chapterId: ch.id,
      section: ch.section,
      chapterTitle: ch.title,
      chapterNumber: ch.number,
      retention,
      daysSinceLastStudy,
      reviewCount,
      masteryLevel,
      nextReviewDate,
      stability,
      isOverdue: reviewCount > 0 && retention < 30,
      isDueToday: daysUntilReview <= 0,
      isComingUp: daysUntilReview > 0 && daysUntilReview <= 7,
    }
  })
}

// ── Dashboard Helper ───────────────────────────────────────────────────

/** Get top chapters needing review, sorted by urgency (lowest retention first). */
export function getReviewQueueForDashboard(
  retentions: ChapterRetention[],
  limit: number,
): ChapterRetention[] {
  return retentions
    .filter((r) => r.reviewCount > 0) // only studied chapters
    .sort((a, b) => {
      // Overdue first, then due today, then by lowest retention
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1
      if (a.isDueToday !== b.isDueToday) return a.isDueToday ? -1 : 1
      return a.retention - b.retention
    })
    .slice(0, limit)
}

// ── Display Helpers ────────────────────────────────────────────────────

export function getMasteryLevelInfo(level: MasteryLevel): { label: string; color: string; bgColor: string } {
  switch (level) {
    case "new":
      return { label: "New", color: "hsl(230, 15%, 50%)", bgColor: "hsl(230, 15%, 95%)" }
    case "learning":
      return { label: "Learning", color: "hsl(25, 55%, 40%)", bgColor: "hsl(25, 55%, 95%)" }
    case "reviewing":
      return { label: "Reviewing", color: "hsl(225, 50%, 35%)", bgColor: "hsl(225, 50%, 95%)" }
    case "mastered":
      return { label: "Mastered", color: "hsl(145, 45%, 30%)", bgColor: "hsl(145, 45%, 95%)" }
  }
}

export function getRetentionColor(retention: number): string {
  if (retention >= 70) return "hsl(145, 45%, 35%)"
  if (retention >= 50) return "hsl(175, 45%, 32%)"
  if (retention >= 30) return "hsl(25, 55%, 40%)"
  return "hsl(0, 65%, 45%)"
}
