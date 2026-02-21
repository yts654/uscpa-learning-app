"use client"

import { useEffect, useRef } from "react"
import { runNotificationChecks } from "@/lib/notifications"
import type { ChapterRetention } from "@/lib/spaced-repetition"
import type { StudyLog } from "@/lib/study-data"
import type { TranslationKey } from "@/lib/i18n"

export function useNotifications(
  chapterRetentions: ChapterRetention[],
  streak: number,
  studyLogs: StudyLog[],
  t: (key: TranslationKey) => string,
) {
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const timer = setTimeout(() => {
      runNotificationChecks(chapterRetentions, streak, studyLogs, t)
    }, 2000)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
