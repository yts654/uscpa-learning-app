"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import React from "react"

export type Locale = "en" | "ja"

const translations = {
  // Nav descriptions
  "nav.dashboard.desc": {
    en: "Overview of your study progress",
    ja: "全体の進捗を確認",
  },
  "nav.chapters.desc": {
    en: "Select a chapter to start studying",
    ja: "チャプターを選んで学習開始",
  },
  "nav.studyLog.desc": {
    en: "View and add study records",
    ja: "学習記録の一覧・追加",
  },
  "nav.review.desc": {
    en: "Spaced repetition review schedule",
    ja: "忘却曲線に基づく復習管理",
  },
  "nav.analytics.desc": {
    en: "Performance analysis and trends",
    ja: "成績の分析・推移",
  },
  "nav.settings.desc": {
    en: "Profile and configuration",
    ja: "プロフィール・設定",
  },

  // Dashboard guide
  "guide.title": {
    en: "How to use",
    ja: "使い方ガイド",
  },
  "guide.step1.title": {
    en: "Select a chapter in Chapters",
    ja: "Chapters でチャプターを選ぶ",
  },
  "guide.step1.desc": {
    en: "Choose a chapter to study",
    ja: "学習する章を選択",
  },
  "guide.step2.title": {
    en: "Record your Study Log",
    ja: "Study Log を記録する",
  },
  "guide.step2.desc": {
    en: "Add study records from the chapter detail page",
    ja: "チャプター詳細画面で学習記録を追加",
  },
  "guide.step3.title": {
    en: "Check your Review schedule",
    ja: "Review で復習スケジュールを確認",
  },
  "guide.step3.desc": {
    en: "Optimal review timing based on the forgetting curve",
    ja: "忘却曲線に基づいた最適な復習タイミング",
  },
  "guide.openChapters": {
    en: "Open Chapters",
    ja: "Chapters を開く",
  },

  // Dashboard empty state
  "dashboard.empty.noSessions": {
    en: "No study sessions recorded yet.",
    ja: "学習記録がまだありません。",
  },
  "dashboard.empty.startStudying": {
    en: "Select a chapter from Chapters to start your first study session.",
    ja: "Chapters からチャプターを選んで最初の学習を記録しましょう",
  },
  "dashboard.empty.openChapters": {
    en: "Open Chapters",
    ja: "Chapters を開く",
  },
  "dashboard.section.noSessions": {
    en: "No study sessions yet for this section.",
    ja: "このセクションの学習記録はまだありません。",
  },
  "dashboard.section.startStudying": {
    en: "Open a chapter in this section to start studying.",
    ja: "このセクションのチャプターを開いて学習を始めましょう",
  },
  "dashboard.section.openChapters": {
    en: "Open chapters",
    ja: "チャプター一覧",
  },

  // Review criteria panel
  "review.criteria.title": {
    en: "Review Schedule Criteria",
    ja: "復習スケジュールの基準",
  },
  "review.criteria.intervals.title": {
    en: "Review Intervals",
    ja: "復習間隔",
  },
  "review.criteria.intervals.desc": {
    en: "The interval until the next review increases with each review",
    ja: "復習回数に応じて次回復習までの間隔が広がります",
  },
  "review.criteria.intervals.1st": { en: "1st", ja: "1回目" },
  "review.criteria.intervals.2nd": { en: "2nd", ja: "2回目" },
  "review.criteria.intervals.3rd": { en: "3rd", ja: "3回目" },
  "review.criteria.intervals.4th": { en: "4th", ja: "4回目" },
  "review.criteria.intervals.5th": { en: "5th+", ja: "5回目〜" },
  "review.criteria.intervals.1d": { en: "after 1 day", ja: "1日後" },
  "review.criteria.intervals.3d": { en: "after 3 days", ja: "3日後" },
  "review.criteria.intervals.7d": { en: "after 7 days", ja: "7日後" },
  "review.criteria.intervals.14d": { en: "after 14 days", ja: "14日後" },
  "review.criteria.intervals.30d": { en: "after 30 days+", ja: "30日後〜" },

  // Alert criteria
  "review.criteria.alerts.title": {
    en: "Alert Criteria",
    ja: "アラート基準",
  },
  "review.criteria.alerts.desc": {
    en: "Retention is calculated automatically from review count and elapsed days",
    ja: "保持率は復習回数と経過日数から自動計算されます",
  },
  "review.criteria.alerts.overdue.label": {
    en: "Overdue — Retention below 30%",
    ja: "期限切れ — 保持率 30%未満",
  },
  "review.criteria.alerts.overdue.desc": {
    en: "Memory has significantly faded. Review immediately.",
    ja: "記憶がかなり薄れています。すぐに復習しましょう",
  },
  "review.criteria.alerts.dueToday.label": {
    en: "Due Today — Next review date is today or earlier",
    ja: "今日が期限 — 次回復習日が今日以前",
  },
  "review.criteria.alerts.dueToday.desc": {
    en: "Scheduled review timing has arrived.",
    ja: "スケジュール通りの復習タイミングです",
  },
  "review.criteria.alerts.comingUp.label": {
    en: "Coming Up — Review due within 7 days",
    ja: "もうすぐ — 7日以内に復習予定",
  },
  "review.criteria.alerts.comingUp.desc": {
    en: "Review timing is approaching soon.",
    ja: "近日中に復習タイミングが来ます",
  },

  // Mastery levels
  "review.criteria.mastery.title": {
    en: "Mastery Levels",
    ja: "習熟度レベル",
  },
  "review.criteria.mastery.new": { en: "Not studied", ja: "未学習" },
  "review.criteria.mastery.learning": { en: "1-2 reviews", ja: "復習 1〜2回" },
  "review.criteria.mastery.reviewing": {
    en: "3-4 reviews or 5+ with retention ≤50%",
    ja: "復習 3〜4回 or 5回以上で保持率≤50%",
  },
  "review.criteria.mastery.mastered": {
    en: "5+ reviews and retention >50%",
    ja: "復習 5回以上 かつ 保持率 >50%",
  },

  // Retention colors
  "review.criteria.retention.title": {
    en: "Retention Color Scale",
    ja: "保持率の色分け",
  },
  "review.criteria.retention.stable": { en: "Stable", ja: "安定" },
  "review.criteria.retention.good": { en: "Good", ja: "良好" },
  "review.criteria.retention.caution": { en: "Caution", ja: "注意" },
  "review.criteria.retention.needsReview": { en: "Needs review", ja: "要復習" },

  // Review alerts
  "review.alert.title": {
    en: "Review Alert",
    ja: "復習アラート",
  },
  "review.alert.retention": {
    en: "Retention",
    ja: "保持率",
  },
  "review.alert.daysAgo": {
    en: "days ago",
    ja: "日前に学習",
  },
  "review.alert.overdue": {
    en: "Needs review",
    ja: "要復習",
  },
  "review.alert.dueToday": {
    en: "Review today",
    ja: "今日が復習日",
  },

  // Review chart
  "review.chart.title": {
    en: "Forgetting Curve — Per Chapter",
    ja: "忘却曲線 — チャプター別",
  },
  "review.chart.selectedDesc": {
    en: "'s forgetting curve",
    ja: " の忘却曲線",
  },
  "review.chart.defaultDesc": {
    en: "Select a chapter to view its individual curve",
    ja: "チャプターを選択すると個別の曲線を表示します",
  },
  "review.chart.xLabel": {
    en: "Days elapsed",
    ja: "経過日数",
  },
  "review.chart.currentCurve": {
    en: "Current curve",
    ja: "現在の曲線",
  },
  "review.chart.nextCurve": {
    en: "Predicted after next review",
    ja: "次回復習後の予測曲線",
  },
  "review.chart.daysSuffix": {
    en: " days elapsed",
    ja: "日経過",
  },
  "review.chart.currentPosition": {
    en: "Current position",
    ja: "現在位置",
  },

  // Review detail labels
  "review.detail.retention": {
    en: "Retention",
    ja: "保持率",
  },
  "review.detail.reviewCount": {
    en: "Review Count",
    ja: "復習回数",
  },
  "review.detail.reviewCountUnit": {
    en: "times",
    ja: "回",
  },
  "review.detail.lastStudied": {
    en: "Last Studied",
    ja: "最終学習",
  },
  "review.detail.daysAgoUnit": {
    en: " days ago",
    ja: "日前",
  },
  "review.detail.nextReview": {
    en: "Next Review",
    ja: "次回復習",
  },
  "review.detail.reviewsSuffix": {
    en: " reviews",
    ja: "回復習",
  },

  // Review header
  "review.header.desc": {
    en: "Based on the Ebbinghaus forgetting curve. Chapters are ranked by memory retention — review overdue items first to maximize long-term recall.",
    ja: "エビングハウスの忘却曲線に基づいています。記憶保持率の低いチャプターから優先的に復習しましょう。",
  },

  // Review urgency groups
  "review.group.overdue.desc": {
    en: "Retention below 30% — review immediately",
    ja: "保持率30%未満 — すぐに復習しましょう",
  },
  "review.group.dueToday.desc": {
    en: "Scheduled for review today",
    ja: "今日が復習予定日です",
  },
  "review.group.comingUp.desc": {
    en: "Due within the next 7 days",
    ja: "7日以内に復習予定",
  },
  "review.group.wellRetained.desc": {
    en: "Retention above 70% — no rush",
    ja: "保持率70%以上 — 急ぐ必要はありません",
  },
  "review.group.notStudied.desc": {
    en: "Start studying to begin tracking retention",
    ja: "学習を開始すると保持率の追跡が始まります",
  },

  // Mock Exams — nav
  "nav.mockExams.desc": {
    en: "Track mock exam scores by section",
    ja: "模試の結果を科目別に記録",
  },

  // Mock Exams — header
  "mockExams.title": {
    en: "Mock Exams",
    ja: "模試結果",
  },
  "mockExams.subtitle": {
    en: "Track your mock exam results across all sections",
    ja: "各科目の模試スコアを記録・追跡",
  },

  // Mock Exams — form
  "mockExams.form.addResult": {
    en: "Add Result",
    ja: "結果を追加",
  },
  "mockExams.form.date": {
    en: "Date",
    ja: "受験日",
  },
  "mockExams.form.section": {
    en: "Section",
    ja: "科目",
  },
  "mockExams.form.source": {
    en: "Source",
    ja: "出典",
  },
  "mockExams.form.sourcePlaceholder": {
    en: "e.g. Becker, Wiley, Roger CPA...",
    ja: "例: Becker, Wiley, TAC...",
  },
  "mockExams.form.mcQuestions": {
    en: "MC Questions",
    ja: "MC問題数",
  },
  "mockExams.form.mcCorrect": {
    en: "MC Correct",
    ja: "MC正解数",
  },
  "mockExams.form.tbsQuestions": {
    en: "TBS Questions",
    ja: "TBS問題数",
  },
  "mockExams.form.tbsCorrect": {
    en: "TBS Correct",
    ja: "TBS正解数",
  },
  "mockExams.form.total": {
    en: "Total",
    ja: "合計",
  },
  "mockExams.form.accuracy": {
    en: "Accuracy",
    ja: "正答率",
  },
  "mockExams.form.memo": {
    en: "Memo",
    ja: "メモ",
  },
  "mockExams.form.memoPlaceholder": {
    en: "Notes about this exam...",
    ja: "この模試についてのメモ...",
  },
  "mockExams.form.submit": {
    en: "Save Result",
    ja: "結果を保存",
  },
  "mockExams.form.cancel": {
    en: "Cancel",
    ja: "キャンセル",
  },
  "mockExams.form.validationError": {
    en: "Correct answers cannot exceed total questions",
    ja: "正解数は問題数を超えられません",
  },

  // Mock Exams — summary cards
  "mockExams.summary.bestScore": {
    en: "Best Score",
    ja: "最高スコア",
  },
  "mockExams.summary.latestScore": {
    en: "Latest Score",
    ja: "最新スコア",
  },
  "mockExams.summary.attempts": {
    en: "Attempts",
    ja: "受験回数",
  },
  "mockExams.summary.noData": {
    en: "No data",
    ja: "データなし",
  },

  // Mock Exams — chart
  "mockExams.chart.title": {
    en: "Score Trend",
    ja: "スコア推移",
  },
  "mockExams.chart.accuracy": {
    en: "Accuracy (%)",
    ja: "正答率 (%)",
  },
  "mockExams.chart.noData": {
    en: "No chart data yet. Add mock exam results to see trends.",
    ja: "チャートデータがありません。模試結果を追加すると推移が表示されます。",
  },

  // Mock Exams — results
  "mockExams.results.title": {
    en: "Results",
    ja: "結果一覧",
  },
  "mockExams.results.empty": {
    en: "No mock exam results yet. Click \"Add Result\" to record your first exam.",
    ja: "模試結果がまだありません。「結果を追加」から最初の結果を記録しましょう。",
  },
  "mockExams.results.delete": {
    en: "Delete",
    ja: "削除",
  },
  "mockExams.results.mc": {
    en: "MC",
    ja: "MC",
  },
  "mockExams.results.tbs": {
    en: "TBS",
    ja: "TBS",
  },

  // Mock Exams — filter
  "mockExams.filter.all": {
    en: "All",
    ja: "すべて",
  },

  // Review — summary strip labels
  "review.summary.studied": { en: "Studied", ja: "学習済み" },
  "review.summary.overdue": { en: "Overdue", ja: "期限切れ" },
  "review.summary.avgRetention": { en: "Avg Retention", ja: "平均保持率" },
  "review.summary.mastered": { en: "Mastered", ja: "習得済み" },

  // Review — urgency group labels
  "review.group.overdue.label": { en: "Overdue", ja: "期限切れ" },
  "review.group.dueToday.label": { en: "Due Today", ja: "今日が復習日" },
  "review.group.comingUp.label": { en: "Coming Up", ja: "もうすぐ" },
  "review.group.wellRetained.label": { en: "Well Retained", ja: "定着済み" },
  "review.group.notStudied.label": { en: "Not Yet Studied", ja: "未学習" },

  // Review — alert section
  "review.alert.needsReview": { en: "Needs review", ja: "要復習" },
  "review.alert.reviewToday": { en: "Review today", ja: "今日が復習日" },

  // Dashboard — review queue
  "dashboard.reviewQueue.title": { en: "Review Queue", ja: "復習キュー" },
  "dashboard.reviewQueue.desc": {
    en: "Chapters needing review based on forgetting curve",
    ja: "忘却曲線に基づく復習が必要なチャプター",
  },
  "dashboard.reviewQueue.viewSchedule": { en: "View Schedule", ja: "スケジュールを見る" },

  // Dashboard — sections
  "dashboard.sections.title": { en: "Exam Sections", ja: "試験セクション" },
  "dashboard.sections.viewAll": { en: "View All Chapters", ja: "全チャプターを見る" },
  "dashboard.recentActivity.title": { en: "Recent Activity", ja: "最近のアクティビティ" },
  "dashboard.recentActivity.viewLog": { en: "View Study Log", ja: "学習記録を見る" },

  // Settings language
  "settings.language": {
    en: "Language",
    ja: "言語",
  },
} as const

export type TranslationKey = keyof typeof translations

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("app-locale") as Locale | null
    if (saved === "en" || saved === "ja") {
      setLocaleState(saved)
    }
    setMounted(true)
  }, [])

  // Sync <html lang="..."> with locale
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale
    }
  }, [locale, mounted])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("app-locale", newLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key]
      if (!entry) return key
      return entry[locale] || entry.en
    },
    [locale]
  )

  // Avoid hydration mismatch by rendering with default locale until mounted
  const contextValue = {
    locale: mounted ? locale : "ja",
    setLocale,
    t: mounted
      ? t
      : (key: TranslationKey) => {
          const entry = translations[key]
          return entry ? entry.ja : key
        },
  }

  return React.createElement(LanguageContext.Provider, { value: contextValue }, children)
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
