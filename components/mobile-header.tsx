"use client"

import { BookOpen, Menu, X, LayoutDashboard, BookMarked, ClipboardList, BarChart3, RefreshCw, Settings, FileText } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage, type TranslationKey } from "@/lib/i18n"

type View = "dashboard" | "chapters" | "study-log" | "mock-exams" | "analytics" | "settings" | "review"

interface MobileHeaderProps {
  currentView: View
  onViewChange: (view: View) => void
}

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType; descKey: TranslationKey }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, descKey: "nav.dashboard.desc" },
  { id: "chapters", label: "Chapters", icon: BookMarked, descKey: "nav.chapters.desc" },
  { id: "study-log", label: "Study Log", icon: ClipboardList, descKey: "nav.studyLog.desc" },
  { id: "mock-exams", label: "Mock Exams", icon: FileText, descKey: "nav.mockExams.desc" },
  { id: "review", label: "Review", icon: RefreshCw, descKey: "nav.review.desc" },
  { id: "analytics", label: "Analytics", icon: BarChart3, descKey: "nav.analytics.desc" },
  { id: "settings", label: "Settings", icon: Settings, descKey: "nav.settings.desc" },
]

export function MobileHeader({ currentView, onViewChange }: MobileHeaderProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-gradient-to-r from-[hsl(232_47%_8%)] to-[hsl(225_50%_12%)] border-b border-[hsl(232_35%_16%)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(0_0%_100%)] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[hsl(232_47%_8%)]" />
          </div>
          <h1 className="font-serif text-base text-[hsl(0_0%_100%)]">CPA Mastery</h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-[hsl(230_15%_60%)] hover:bg-[hsl(232_40%_14%)]"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {isOpen && (
        <nav className="px-3 pb-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { onViewChange(item.id); setIsOpen(false) }}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                  currentView === item.id
                    ? "bg-[hsl(0_0%_100%)] text-[hsl(232_47%_8%)]"
                    : "text-[hsl(230_15%_60%)] hover:bg-[hsl(232_40%_14%)]"
                )}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  {item.label}
                  <p className={cn(
                    "text-[10px] font-normal leading-tight mt-0.5",
                    currentView === item.id ? "text-[hsl(232_47%_8%)]/60" : "text-[hsl(230_15%_40%)]"
                  )}>{t(item.descKey)}</p>
                </div>
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
