"use client"

import { useRef, useEffect } from "react"
import { BookOpen, LayoutDashboard, BookMarked, ClipboardList, BarChart3, RefreshCw, Settings, FileText, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage, type TranslationKey } from "@/lib/i18n"
import { useTheme } from "next-themes"

type View = "dashboard" | "chapters" | "study-log" | "mock-exams" | "analytics" | "settings" | "review"

interface MobileHeaderProps {
  currentView: View
  onViewChange: (view: View) => void
}

const NAV_ITEMS: { id: View; labelKey: TranslationKey; icon: React.ElementType }[] = [
  { id: "dashboard", labelKey: "nav.home", icon: LayoutDashboard },
  { id: "chapters", labelKey: "nav.chapters", icon: BookMarked },
  { id: "study-log", labelKey: "nav.log", icon: ClipboardList },
  { id: "mock-exams", labelKey: "nav.mock", icon: FileText },
  { id: "review", labelKey: "nav.review", icon: RefreshCw },
  { id: "analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
]

export function MobileHeader({ currentView, onViewChange }: MobileHeaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const { locale, setLocale, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  const toggleLocale = () => setLocale(locale === "es" ? "en" : "es")
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  // Scroll active tab into view on mount and view change
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const active = activeRef.current
      const offset = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2
      container.scrollTo({ left: offset, behavior: "smooth" })
    }
  }, [currentView])

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-gradient-to-r from-[hsl(232_47%_8%)] to-[hsl(225_50%_12%)]">
      {/* Brand row */}
      <div className="flex items-center px-4 py-2.5 border-b border-[hsl(232_35%_16%)]">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-[hsl(0_0%_100%)] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-[hsl(232_47%_8%)]" />
          </div>
          <h1 className="font-serif text-sm text-[hsl(0_0%_100%)]">CPA Mastery</h1>
        </div>
        {/* Quick toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLocale}
            className="w-7 h-7 rounded-md bg-[hsl(232_40%_14%)] hover:bg-[hsl(232_40%_20%)] flex items-center justify-center transition-colors"
          >
            <span className="text-[9px] font-bold text-[hsl(230_15%_72%)]">{locale === "es" ? "EN" : "ES"}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-md bg-[hsl(232_40%_14%)] hover:bg-[hsl(232_40%_20%)] flex items-center justify-center transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-[hsl(40_80%_60%)]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[hsl(230_15%_72%)]" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable tab bar */}
      <div
        ref={scrollRef}
        data-tour="mobile-tabs"
        className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onViewChange(item.id)}
              data-tour={item.id === "dashboard" ? undefined : `nav-${item.id}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 min-h-[40px]",
                isActive
                  ? "bg-[hsl(0_0%_100%)] text-[hsl(232_47%_8%)]"
                  : "text-[hsl(230_15%_70%)] active:bg-[hsl(232_40%_14%)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {t(item.labelKey)}
            </button>
          )
        })}
      </div>
    </header>
  )
}
