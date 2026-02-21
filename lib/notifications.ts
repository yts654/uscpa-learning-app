import type { ChapterRetention } from "@/lib/spaced-repetition"
import type { StudyLog } from "@/lib/study-data"
import type { TranslationKey } from "@/lib/i18n"

// ── Types ──────────────────────────────────────────────────────────────
export interface NotificationPrefs {
  review: boolean
  streak: boolean
  weekly: boolean
  milestone: boolean
}

interface MilestonesSeen {
  streaks: number[]
  hours: number[]
}

// ── Defaults & localStorage helpers ────────────────────────────────────
const PREFS_KEY = "notif-prefs"
const COOLDOWN_REVIEW = "notif-cooldown-review"
const COOLDOWN_STREAK = "notif-cooldown-streak"
const COOLDOWN_WEEKLY = "notif-cooldown-weekly"
const MILESTONES_KEY = "notif-milestones-seen"

const DEFAULT_PREFS: NotificationPrefs = { review: true, streak: true, weekly: true, milestone: true }

export function getNotifPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_PREFS }
}

export function setNotifPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

function getMilestonesSeen(): MilestonesSeen {
  try {
    const raw = localStorage.getItem(MILESTONES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { streaks: [], hours: [] }
}

function setMilestonesSeen(m: MilestonesSeen) {
  localStorage.setItem(MILESTONES_KEY, JSON.stringify(m))
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function mondayStr(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split("T")[0]
}

function isCooldownActive(key: string, expected: string): boolean {
  return localStorage.getItem(key) === expected
}

function setCooldown(key: string, value: string) {
  localStorage.setItem(key, value)
}

// ── Service Worker ─────────────────────────────────────────────────────
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null
  try {
    return await navigator.serviceWorker.register("/sw.js")
  } catch {
    return null
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  const result = await Notification.requestPermission()
  return result === "granted"
}

// ── Checker functions ──────────────────────────────────────────────────
type T = (key: TranslationKey) => string

function interpolate(template: string, vars: Record<string, string | number>): string {
  let result = template
  for (const [k, v] of Object.entries(vars)) {
    result = result.replace(`{${k}}`, String(v))
  }
  return result
}

async function checkReviewAlert(
  reg: ServiceWorkerRegistration,
  retentions: ChapterRetention[],
  t: T,
): Promise<boolean> {
  if (isCooldownActive(COOLDOWN_REVIEW, todayStr())) return false

  const needsReview = retentions.filter(r => r.isOverdue || r.isDueToday)
  if (needsReview.length === 0) return false

  const lowest = needsReview.reduce((a, b) => (a.retention < b.retention ? a : b))
  const body = interpolate(t("notif.review.body" as TranslationKey), {
    count: needsReview.length,
    chapter: lowest.chapterTitle,
    retention: Math.round(lowest.retention),
  })

  await reg.showNotification(t("notif.review.title" as TranslationKey), {
    body,
    icon: "/constellation.svg",
    tag: "review-alert",
  })
  setCooldown(COOLDOWN_REVIEW, todayStr())
  return true
}

async function checkStreakProtection(
  reg: ServiceWorkerRegistration,
  streak: number,
  studyLogs: StudyLog[],
  t: T,
): Promise<boolean> {
  if (isCooldownActive(COOLDOWN_STREAK, todayStr())) return false
  if (streak <= 0) return false

  const today = todayStr()
  const hasStudiedToday = studyLogs.some(l => l.date === today)
  if (hasStudiedToday) return false

  const body = interpolate(t("notif.streak.body" as TranslationKey), { streak })

  await reg.showNotification(t("notif.streak.title" as TranslationKey), {
    body,
    icon: "/constellation.svg",
    tag: "streak-protection",
  })
  setCooldown(COOLDOWN_STREAK, todayStr())
  return true
}

async function checkWeeklySummary(
  reg: ServiceWorkerRegistration,
  studyLogs: StudyLog[],
  t: T,
): Promise<boolean> {
  const monday = mondayStr()
  if (isCooldownActive(COOLDOWN_WEEKLY, monday)) return false

  // Get last week's date range (Monday-Sunday before this Monday)
  const thisMonday = new Date(monday + "T00:00:00")
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(lastMonday.getDate() - 7)
  const lastSunday = new Date(thisMonday)
  lastSunday.setDate(lastSunday.getDate() - 1)

  const lastMondayStr = lastMonday.toISOString().split("T")[0]
  const lastSundayStr = lastSunday.toISOString().split("T")[0]

  const lastWeekLogs = studyLogs.filter(l => l.date >= lastMondayStr && l.date <= lastSundayStr)
  if (lastWeekLogs.length === 0) return false

  const hours = Math.round(lastWeekLogs.reduce((s, l) => s + l.studyHours, 0) * 10) / 10
  const sessions = lastWeekLogs.length
  const totalQ = lastWeekLogs.reduce((s, l) => s + l.questionsAnswered, 0)
  const totalC = lastWeekLogs.reduce((s, l) => s + l.correctAnswers, 0)
  const accuracy = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0

  const body = interpolate(t("notif.weekly.body" as TranslationKey), { hours, sessions, accuracy })

  await reg.showNotification(t("notif.weekly.title" as TranslationKey), {
    body,
    icon: "/constellation.svg",
    tag: "weekly-summary",
  })
  setCooldown(COOLDOWN_WEEKLY, monday)
  return true
}

async function checkMilestone(
  reg: ServiceWorkerRegistration,
  streak: number,
  studyLogs: StudyLog[],
  t: T,
): Promise<boolean> {
  const seen = getMilestonesSeen()
  const streakMilestones = [7, 14, 30, 60, 90, 180, 365]
  const hourMilestones = [10, 25, 50, 100, 250, 500]

  // Check streak milestones
  for (const m of streakMilestones) {
    if (streak >= m && !seen.streaks.includes(m)) {
      const body = interpolate(t("notif.milestone.streak" as TranslationKey), { n: m })
      await reg.showNotification(t("notif.milestone.title" as TranslationKey), {
        body,
        icon: "/constellation.svg",
        tag: "milestone",
      })
      seen.streaks.push(m)
      setMilestonesSeen(seen)
      return true
    }
  }

  // Check total hours milestones
  const totalHours = studyLogs.reduce((s, l) => s + l.studyHours, 0)
  for (const m of hourMilestones) {
    if (totalHours >= m && !seen.hours.includes(m)) {
      const body = interpolate(t("notif.milestone.hours" as TranslationKey), { n: m })
      await reg.showNotification(t("notif.milestone.title" as TranslationKey), {
        body,
        icon: "/constellation.svg",
        tag: "milestone",
      })
      seen.hours.push(m)
      setMilestonesSeen(seen)
      return true
    }
  }

  return false
}

// ── Orchestrator ───────────────────────────────────────────────────────
export async function runNotificationChecks(
  chapterRetentions: ChapterRetention[],
  streak: number,
  studyLogs: StudyLog[],
  t: T,
): Promise<void> {
  const prefs = getNotifPrefs()
  const hasPermission = await ensureNotificationPermission()
  if (!hasPermission) return

  const reg = await registerServiceWorker()
  if (!reg) return

  // Priority order — only 1 notification per app launch
  if (prefs.review && await checkReviewAlert(reg, chapterRetentions, t)) return
  if (prefs.streak && await checkStreakProtection(reg, streak, studyLogs, t)) return
  if (prefs.weekly && await checkWeeklySummary(reg, studyLogs, t)) return
  if (prefs.milestone && await checkMilestone(reg, streak, studyLogs, t)) return
}
