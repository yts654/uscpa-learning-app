"use client"

import { useState } from "react"
import { ChapterDetailView } from "@/components/chapter-detail-view"
import { CHAPTERS, INITIAL_ESSENCE_NOTES, type StudyLog, type EssenceNote } from "@/lib/study-data"

export default function Test2Page() {
  const chapter = CHAPTERS[0]
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([])
  const [essenceNotes, setEssenceNotes] = useState<EssenceNote[]>(
    INITIAL_ESSENCE_NOTES.filter(n => n.chapterId === chapter.id)
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-red-600">TEST 2: ChapterDetailView</h1>
      <ChapterDetailView
        chapter={chapter}
        onBack={() => alert("Back clicked")}
        studyLogs={studyLogs}
        onAddLog={(log) => setStudyLogs(prev => [log, ...prev])}
        essenceNotes={essenceNotes}
        onAddNote={(note) => setEssenceNotes(prev => [...prev, note])}
        onRemoveNote={(id) => setEssenceNotes(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  )
}
