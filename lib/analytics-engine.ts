import {
  type ExamSection,
  type Chapter,
  type StudyLog,
  type StudyGoals,
  type RecallRecord,
  type RecallRating,
  SECTION_INFO,
} from "@/lib/study-data"
import { type ChapterRetention } from "@/lib/spaced-repetition"

// ── Result Types ────────────────────────────────────────────────────

export interface PaceResult {
  section: ExamSection
  totalChapters: number
  completedChapters: number
  remainingChapters: number
  estimatedRemainingHours: number
  weeklyActualHours: number
  weeklyRequiredHours: number
  etaDate: string | null
  examDate: string | null
  delayDays: number          // positive = behind, negative = ahead
  weeksLeft: number
  status: "on-track" | "ahead" | "behind" | "no-goal"
}

export type RiskLevel = "critical" | "warning" | "info"

export interface RiskItem {
  id: string
  level: RiskLevel
  category: string
  title: string
  description: string
  prescription: string
}

export interface CalibrationEntry {
  chapterId: string
  section: ExamSection
  chapterTitle: string
  chapterNumber: number
  predictedRetention: number
  actualRetention: number
  gap: number
  action: "shorten" | "extend" | "on-track"
}

export interface AllocationRecommendation {
  section: ExamSection
  currentHoursPerWeek: number
  recommendedHoursPerWeek: number
  change: "increase" | "decrease" | "maintain"
  reason: string
}

export interface CoverageItem {
  chapterId: string
  section: ExamSection
  chapterTitle: string
  chapterNumber: number
  type: "untouched" | "fragile"
  urgency: "urgent" | "normal"
  retention?: number
}

// ── A. Pace Engine ──────────────────────────────────────────────────

export function calculatePace(
  section: ExamSection,
  chapters: Chapter[],
  studyLogs: StudyLog[],
  examDate: string | null,
): PaceResult {
  const sectionChapters = chapters.filter(c => c.section === section)
  const sectionLogs = studyLogs.filter(l => l.section === section)
  const totalChapters = sectionChapters.length

  // Count chapters that have at least one study log
  const studiedChapterIds = new Set(sectionLogs.map(l => l.chapterId))
  const completedChapters = studiedChapterIds.size
  const remainingChapters = totalChapters - completedChapters

  // Average hours per chapter (from completed chapters)
  const totalHoursSpent = sectionLogs.reduce((sum, l) => sum + l.studyHours, 0)
  const avgHoursPerChapter = completedChapters > 0 ? totalHoursSpent / completedChapters : 2.0
  const estimatedRemainingHours = remainingChapters * avgHoursPerChapter

  // Weekly actual: last 4 weeks average
  const today = new Date()
  const fourWeeksAgo = new Date(today)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  const fourWeeksAgoStr = fourWeeksAgo.toISOString().split("T")[0]

  const recentLogs = sectionLogs.filter(l => l.date >= fourWeeksAgoStr)
  const recentHours = recentLogs.reduce((sum, l) => sum + l.studyHours, 0)
  const weeklyActualHours = recentHours / 4

  if (!examDate) {
    return {
      section,
      totalChapters,
      completedChapters,
      remainingChapters,
      estimatedRemainingHours,
      weeklyActualHours,
      weeklyRequiredHours: 0,
      etaDate: null,
      examDate: null,
      delayDays: 0,
      weeksLeft: 0,
      status: "no-goal",
    }
  }

  const examD = new Date(examDate + "T00:00:00")
  const weeksLeft = Math.max(0, (examD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7))
  const weeklyRequiredHours = weeksLeft > 0 ? estimatedRemainingHours / weeksLeft : estimatedRemainingHours

  // ETA: how long at current pace
  let etaDate: string | null = null
  let delayDays = 0
  if (weeklyActualHours > 0) {
    const weeksNeeded = estimatedRemainingHours / weeklyActualHours
    const etaD = new Date(today)
    etaD.setDate(etaD.getDate() + Math.ceil(weeksNeeded * 7))
    etaDate = etaD.toISOString().split("T")[0]
    delayDays = Math.round((etaD.getTime() - examD.getTime()) / (1000 * 60 * 60 * 24))
  } else if (remainingChapters > 0) {
    delayDays = 999 // infinite delay
  }

  let status: PaceResult["status"] = "on-track"
  if (delayDays > 7) status = "behind"
  else if (delayDays < -7) status = "ahead"

  return {
    section,
    totalChapters,
    completedChapters,
    remainingChapters,
    estimatedRemainingHours,
    weeklyActualHours,
    weeklyRequiredHours,
    etaDate,
    examDate,
    delayDays,
    weeksLeft: Math.round(weeksLeft * 10) / 10,
    status,
  }
}

export function calculateAllSectionPaces(
  chapters: Chapter[],
  studyLogs: StudyLog[],
  studyGoals: StudyGoals,
): PaceResult[] {
  return (["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map(section =>
    calculatePace(section, chapters, studyLogs, studyGoals.sections[section].examDate)
  )
}

// ── B. Risk Detection ───────────────────────────────────────────────

export function detectReviewDebt(
  chapterRetentions: ChapterRetention[],
): RiskItem | null {
  const overdue = chapterRetentions.filter(r => r.reviewCount > 0 && r.isOverdue)
  if (overdue.length > 5) {
    return {
      id: "review-debt",
      level: "critical",
      category: "analytics.risk.reviewDebt",
      title: `${overdue.length} chapters overdue`,
      description: `${overdue.length} chapters have retention below 30%. Memory is fading rapidly.`,
      prescription: "Prioritize reviewing overdue chapters before studying new material.",
    }
  }
  if (overdue.length > 2) {
    return {
      id: "review-debt",
      level: "warning",
      category: "analytics.risk.reviewDebt",
      title: `${overdue.length} chapters overdue`,
      description: `${overdue.length} chapters need review soon to prevent forgetting.`,
      prescription: "Schedule 30 minutes daily for overdue reviews.",
    }
  }
  return null
}

export function detectCrammingRisk(
  studyLogs: StudyLog[],
  days: number = 14,
): RiskItem | null {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split("T")[0]
  const recentLogs = studyLogs.filter(l => l.date >= cutoffStr)

  // Count distinct chapters studied — if same chapter appears only once, it's "new"
  const chapterDateCount: Record<string, number> = {}
  recentLogs.forEach(l => {
    chapterDateCount[l.chapterId] = (chapterDateCount[l.chapterId] || 0) + 1
  })

  const newStudy = Object.values(chapterDateCount).filter(c => c === 1).length
  const reviewStudy = Object.values(chapterDateCount).filter(c => c > 1).length

  if (reviewStudy === 0 && newStudy > 3) {
    return {
      id: "cramming",
      level: "critical",
      category: "analytics.risk.cramming",
      title: "All new material, no reviews",
      description: `In the last ${days} days you studied ${newStudy} new chapters without reviewing any.`,
      prescription: "Use the 70/30 rule: 70% new material, 30% reviews.",
    }
  }
  if (newStudy > 0 && reviewStudy > 0) {
    const ratio = newStudy / reviewStudy
    if (ratio > 4) {
      return {
        id: "cramming",
        level: "critical",
        category: "analytics.risk.cramming",
        title: "New:Review ratio too high",
        description: `Ratio is ${ratio.toFixed(1)}:1. You're learning too fast without reinforcing.`,
        prescription: "Slow down on new chapters and catch up on reviews.",
      }
    }
    if (ratio > 2.5) {
      return {
        id: "cramming",
        level: "warning",
        category: "analytics.risk.cramming",
        title: "Consider more reviews",
        description: `New:Review ratio is ${ratio.toFixed(1)}:1 (ideal < 2.5:1).`,
        prescription: "Add 1-2 review sessions per week to balance learning.",
      }
    }
  }
  return null
}

export function detectStagnationRisk(
  studyLogs: StudyLog[],
  chapterRetentions: ChapterRetention[],
): RiskItem | null {
  // Find chapters with 3+ reviews where accuracy isn't improving
  const chapterLogs: Record<string, StudyLog[]> = {}
  studyLogs.forEach(l => {
    if (!chapterLogs[l.chapterId]) chapterLogs[l.chapterId] = []
    chapterLogs[l.chapterId].push(l)
  })

  const stagnant: string[] = []
  Object.entries(chapterLogs).forEach(([chapterId, logs]) => {
    if (logs.length < 3) return
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date))
    const recent = sorted.slice(-3)
    const accuracies = recent.map(l =>
      l.questionsAnswered > 0 ? l.correctAnswers / l.questionsAnswered : 0
    )
    // Check if accuracy improved from first to last of recent 3
    if (accuracies[2] <= accuracies[0] && accuracies[1] <= accuracies[0]) {
      stagnant.push(chapterId)
    }
  })

  if (stagnant.length >= 3) {
    return {
      id: "stagnation",
      level: "warning",
      category: "analytics.risk.stagnation",
      title: `${stagnant.length} chapters not improving`,
      description: "Multiple chapters show no accuracy improvement despite repeated reviews.",
      prescription: "Try different study methods: watch videos, practice TBS, or teach the concept.",
    }
  }
  if (stagnant.length >= 1) {
    return {
      id: "stagnation",
      level: "info",
      category: "analytics.risk.stagnation",
      title: `${stagnant.length} chapter${stagnant.length > 1 ? "s" : ""} plateaued`,
      description: "Some chapters aren't showing improvement with current study approach.",
      prescription: "Consider changing study techniques for these chapters.",
    }
  }
  return null
}

export function detectUntouchedRisk(
  chapters: Chapter[],
  studyLogs: StudyLog[],
  studyGoals: StudyGoals,
): RiskItem | null {
  const studiedIds = new Set(studyLogs.map(l => l.chapterId))
  const untouched = chapters.filter(c => !studiedIds.has(c.id))
  const untouchedPct = untouched.length / chapters.length

  // Check if any exam is within 30 days
  const today = new Date()
  const hasUpcomingExam = (["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).some(section => {
    const examDate = studyGoals.sections[section].examDate
    if (!examDate) return false
    const daysUntil = (new Date(examDate + "T00:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntil <= 30 && daysUntil > 0
  })

  if (untouchedPct > 0.6 && hasUpcomingExam) {
    return {
      id: "untouched",
      level: "critical",
      category: "analytics.risk.untouched",
      title: `${Math.round(untouchedPct * 100)}% chapters untouched`,
      description: `${untouched.length} of ${chapters.length} chapters haven't been studied yet, with an exam within 30 days.`,
      prescription: "Focus on high-yield chapters and create a rapid coverage plan.",
    }
  }
  if (untouchedPct > 0.5) {
    return {
      id: "untouched",
      level: "warning",
      category: "analytics.risk.untouched",
      title: `${Math.round(untouchedPct * 100)}% chapters untouched`,
      description: `${untouched.length} chapters haven't been studied yet.`,
      prescription: "Increase daily study time or prioritize key chapters.",
    }
  }
  return null
}

export function detectVarianceRisk(
  studyLogs: StudyLog[],
  weeks: number = 4,
): RiskItem | null {
  const today = new Date()
  const weeklyHours: number[] = []

  for (let w = 0; w < weeks; w++) {
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() - w * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 7)
    const startStr = weekStart.toISOString().split("T")[0]
    const endStr = weekEnd.toISOString().split("T")[0]

    const hours = studyLogs
      .filter(l => l.date > startStr && l.date <= endStr)
      .reduce((sum, l) => sum + l.studyHours, 0)
    weeklyHours.push(hours)
  }

  const mean = weeklyHours.reduce((a, b) => a + b, 0) / weeklyHours.length
  if (mean === 0) return null

  const variance = weeklyHours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / weeklyHours.length
  const cv = Math.sqrt(variance) / mean

  if (cv > 0.7) {
    return {
      id: "variance",
      level: "critical",
      category: "analytics.risk.variance",
      title: "Highly inconsistent study schedule",
      description: `Weekly hours vary greatly (CV=${(cv * 100).toFixed(0)}%). Consistency beats intensity.`,
      prescription: "Set a fixed daily study time and stick to it, even if shorter.",
    }
  }
  if (cv > 0.5) {
    return {
      id: "variance",
      level: "warning",
      category: "analytics.risk.variance",
      title: "Inconsistent study pattern",
      description: `Study hours fluctuate week to week (CV=${(cv * 100).toFixed(0)}%).`,
      prescription: "Try to maintain a more consistent daily routine.",
    }
  }
  return null
}

export function detectAllRisks(
  chapters: Chapter[],
  studyLogs: StudyLog[],
  chapterRetentions: ChapterRetention[],
  studyGoals: StudyGoals,
): RiskItem[] {
  const risks: RiskItem[] = []
  const r1 = detectReviewDebt(chapterRetentions)
  if (r1) risks.push(r1)
  const r2 = detectCrammingRisk(studyLogs)
  if (r2) risks.push(r2)
  const r3 = detectStagnationRisk(studyLogs, chapterRetentions)
  if (r3) risks.push(r3)
  const r4 = detectUntouchedRisk(chapters, studyLogs, studyGoals)
  if (r4) risks.push(r4)
  const r5 = detectVarianceRisk(studyLogs)
  if (r5) risks.push(r5)

  // Sort: critical > warning > info
  const levelOrder: Record<RiskLevel, number> = { critical: 0, warning: 1, info: 2 }
  return risks.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
}

// ── C. Retention Calibration ────────────────────────────────────────

export function recallRatingToRetention(rating: RecallRating): number {
  const map: Record<RecallRating, number> = { 0: 10, 1: 40, 2: 70, 3: 95 }
  return map[rating]
}

export function calibrateRetention(
  chapterRetentions: ChapterRetention[],
  recallRecords: RecallRecord[],
): CalibrationEntry[] {
  if (recallRecords.length === 0) return []

  // Group recall records by chapter, take latest
  const latestByChapter: Record<string, RecallRecord> = {}
  recallRecords.forEach(r => {
    if (!latestByChapter[r.chapterId] || r.date > latestByChapter[r.chapterId].date) {
      latestByChapter[r.chapterId] = r
    }
  })

  const entries: CalibrationEntry[] = []
  Object.entries(latestByChapter).forEach(([chapterId, record]) => {
    const retention = chapterRetentions.find(r => r.chapterId === chapterId)
    if (!retention || retention.reviewCount === 0) return

    const predicted = record.predictedRetention
    const actual = recallRatingToRetention(record.rating)
    const gap = actual - predicted

    let action: CalibrationEntry["action"] = "on-track"
    if (gap < -15) action = "shorten"
    else if (gap > 15) action = "extend"

    entries.push({
      chapterId,
      section: retention.section,
      chapterTitle: retention.chapterTitle,
      chapterNumber: retention.chapterNumber,
      predictedRetention: predicted,
      actualRetention: actual,
      gap,
      action,
    })
  })

  return entries.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
}

// ── D. Allocation Optimizer ─────────────────────────────────────────

export function generateAllocations(
  paces: PaceResult[],
  risks: RiskItem[],
  studyLogs: StudyLog[],
  chapterRetentions: ChapterRetention[],
  studyGoals: StudyGoals,
): AllocationRecommendation[] {
  const weeklyBudget = studyGoals.dailyStudyHours * 7

  // Current distribution from last 4 weeks
  const today = new Date()
  const fourWeeksAgo = new Date(today)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  const cutoff = fourWeeksAgo.toISOString().split("T")[0]

  const sectionHours: Record<ExamSection, number> = { FAR: 0, AUD: 0, REG: 0, BEC: 0, TCP: 0 }
  studyLogs.filter(l => l.date >= cutoff).forEach(l => {
    sectionHours[l.section] += l.studyHours
  })
  const totalRecentHours = Object.values(sectionHours).reduce((a, b) => a + b, 0)

  const recommendations: AllocationRecommendation[] = (["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map(section => {
    const pace = paces.find(p => p.section === section)
    const currentPerWeek = totalRecentHours > 0 ? (sectionHours[section] / 4) : weeklyBudget / 5

    let recommendedPerWeek = currentPerWeek
    let reason = "Current pace looks good."
    let change: AllocationRecommendation["change"] = "maintain"

    if (pace && pace.status === "behind" && pace.delayDays > 7) {
      const increase = Math.min(currentPerWeek * 0.5, 3)
      recommendedPerWeek = currentPerWeek + increase
      change = "increase"
      reason = `Behind by ${pace.delayDays} days. Increase pace to catch up.`
    } else if (pace && pace.status === "ahead" && pace.delayDays < -14) {
      recommendedPerWeek = Math.max(currentPerWeek * 0.7, 1)
      change = "decrease"
      reason = "Ahead of schedule. Redistribute time to weaker sections."
    }

    // Override for sections with many overdue chapters
    const sectionRetentions = chapterRetentions.filter(r => r.section === section)
    const overdueCount = sectionRetentions.filter(r => r.isOverdue).length
    if (overdueCount > 3) {
      recommendedPerWeek = Math.max(recommendedPerWeek, currentPerWeek + 2)
      change = "increase"
      reason = `${overdueCount} overdue chapters need urgent review.`
    }

    return {
      section,
      currentHoursPerWeek: Math.round(currentPerWeek * 10) / 10,
      recommendedHoursPerWeek: Math.round(recommendedPerWeek * 10) / 10,
      change,
      reason,
    }
  })

  // Normalize total to weekly budget
  const totalRecommended = recommendations.reduce((sum, r) => sum + r.recommendedHoursPerWeek, 0)
  if (totalRecommended > 0) {
    const scale = weeklyBudget / totalRecommended
    recommendations.forEach(r => {
      r.recommendedHoursPerWeek = Math.round(r.recommendedHoursPerWeek * scale * 10) / 10
    })
  }

  return recommendations
}

// ── E. Coverage Analysis ────────────────────────────────────────────

export function analyzeCoverage(
  chapters: Chapter[],
  studyLogs: StudyLog[],
  chapterRetentions: ChapterRetention[],
  studyGoals: StudyGoals,
): CoverageItem[] {
  const today = new Date()
  const studiedIds = new Set(studyLogs.map(l => l.chapterId))
  const items: CoverageItem[] = []

  chapters.forEach(ch => {
    const retention = chapterRetentions.find(r => r.chapterId === ch.id)

    if (!studiedIds.has(ch.id)) {
      // Check if section has an exam within 60 days
      const examDate = studyGoals.sections[ch.section].examDate
      let urgency: CoverageItem["urgency"] = "normal"
      if (examDate) {
        const daysUntil = (new Date(examDate + "T00:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        if (daysUntil <= 60 && daysUntil > 0) urgency = "urgent"
      }
      items.push({
        chapterId: ch.id,
        section: ch.section,
        chapterTitle: ch.title,
        chapterNumber: ch.number,
        type: "untouched",
        urgency,
      })
    } else if (retention && retention.retention < 30 && retention.reviewCount > 0) {
      items.push({
        chapterId: ch.id,
        section: ch.section,
        chapterTitle: ch.title,
        chapterNumber: ch.number,
        type: "fragile",
        urgency: "urgent",
        retention: retention.retention,
      })
    }
  })

  // Sort: urgent first, then by section
  return items.sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency === "urgent" ? -1 : 1
    if (a.type !== b.type) return a.type === "fragile" ? -1 : 1
    return a.section.localeCompare(b.section) || a.chapterNumber - b.chapterNumber
  })
}
