"use client"

import { useMemo } from "react"
import { type Chapter, type StudyLog, type StudyGoals, type RecallRecord, type MockExam, type ExamSection } from "@/lib/study-data"
import { type ChapterRetention } from "@/lib/spaced-repetition"
import {
  calculateAllSectionPaces,
  detectAllRisks,
  calibrateRetention,
  generateAllocations,
  analyzeCoverage,
} from "@/lib/analytics-engine"
import { useLanguage } from "@/lib/i18n"

import { PaceEngineCard } from "@/components/analytics/pace-engine-card"
import { RiskRadarCard } from "@/components/analytics/risk-radar-card"
import { RetentionCalibrationCard } from "@/components/analytics/retention-calibration-card"
import { AllocationCard } from "@/components/analytics/allocation-card"
import { CoverageCard } from "@/components/analytics/coverage-card"
import { DrillDownCard } from "@/components/analytics/drill-down-card"

interface AnalyticsViewProps {
  chapters: Chapter[]
  studyLogs: StudyLog[]
  chapterRetentions: ChapterRetention[]
  studyGoals: StudyGoals
  mockExams: MockExam[]
  completedSections: ExamSection[]
  recallRecords: RecallRecord[]
}

export function AnalyticsView({
  chapters,
  studyLogs,
  chapterRetentions,
  studyGoals,
  mockExams,
  completedSections,
  recallRecords,
}: AnalyticsViewProps) {
  const { t } = useLanguage()

  // Compute all analytics data
  const paces = useMemo(
    () => calculateAllSectionPaces(chapters, studyLogs, studyGoals),
    [chapters, studyLogs, studyGoals]
  )

  const risks = useMemo(
    () => detectAllRisks(chapters, studyLogs, chapterRetentions, studyGoals, t),
    [chapters, studyLogs, chapterRetentions, studyGoals, t]
  )

  const calibration = useMemo(
    () => calibrateRetention(chapterRetentions, recallRecords),
    [chapterRetentions, recallRecords]
  )

  const allocations = useMemo(
    () => generateAllocations(paces, risks, studyLogs, chapterRetentions, studyGoals, t),
    [paces, risks, studyLogs, chapterRetentions, studyGoals, t]
  )

  const coverage = useMemo(
    () => analyzeCoverage(chapters, studyLogs, chapterRetentions, studyGoals),
    [chapters, studyLogs, chapterRetentions, studyGoals]
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground text-balance">{t("analytics.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("analytics.subtitle")}</p>
      </div>

      {/* Row 1: Allocation + Pace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationCard allocations={allocations} />
        <PaceEngineCard paces={paces} />
      </div>

      {/* Row 2: Risk + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskRadarCard risks={risks} />
        <RetentionCalibrationCard entries={calibration} />
      </div>

      {/* Row 3: Coverage */}
      <CoverageCard items={coverage} />

      {/* Row 4: Drill-Down (collapsible) */}
      <DrillDownCard studyLogs={studyLogs} />
    </div>
  )
}
