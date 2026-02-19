"use client"

import { LayoutDashboard, BookOpen, BarChart3, ClipboardList, Settings, LogOut, Flame, BookMarked, RefreshCw, FileText, Sun, Moon, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage, type TranslationKey } from "@/lib/i18n"
import { useTheme } from "next-themes"

type View = "dashboard" | "chapters" | "study-log" | "mock-exams" | "analytics" | "settings" | "review"

interface AppSidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  streak: number
  profile: { name: string; photoUrl: string | null }
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

export function AppSidebar({ currentView, onViewChange, streak, profile }: AppSidebarProps) {
  const { t, locale, setLocale } = useLanguage()
  const { theme, setTheme } = useTheme()
  const initials = profile.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const toggleLocale = () => setLocale(locale === "es" ? "en" : "es")
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[hsl(232_47%_8%)] text-[hsl(230_15%_82%)] min-h-screen">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[hsl(232_35%_16%)]">
        <div className="w-9 h-9 rounded-lg bg-[hsl(0_0%_100%)] flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-[hsl(232_47%_8%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-lg text-[hsl(0_0%_100%)] leading-tight">CPA Mastery</h1>
          <p className="text-xs text-[hsl(230_15%_50%)] tracking-wide uppercase">Study Platform</p>
        </div>
        {/* Quick toggles */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={toggleLocale}
            className="w-7 h-7 rounded-md bg-[hsl(232_40%_14%)] hover:bg-[hsl(232_40%_20%)] flex items-center justify-center transition-colors"
            title={locale === "es" ? "Switch to English" : "Switch to Spanish"}
          >
            <span className="text-[9px] font-bold text-[hsl(230_15%_72%)]">{locale === "es" ? "EN" : "ES"}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-md bg-[hsl(232_40%_14%)] hover:bg-[hsl(232_40%_20%)] flex items-center justify-center transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-[hsl(40_80%_60%)]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[hsl(230_15%_72%)]" />
            )}
          </button>
        </div>
      </div>

      {/* Streak Badge */}
      <div className="mx-4 mt-5 mb-2 p-3 rounded-lg bg-gradient-to-r from-[hsl(225,50%,18%)] to-[hsl(175,45%,20%)] border border-[hsl(225,50%,24%)]">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[hsl(25,55%,50%)]" />
          <span className="text-xs font-medium text-[hsl(230_15%_60%)] uppercase tracking-wider">Study Streak</span>
        </div>
        <p className="text-2xl font-bold text-[hsl(0_0%_100%)] mt-1">{streak} <span className="text-sm font-normal text-[hsl(230_15%_50%)]">days</span></p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-4 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-[hsl(230_15%_40%)] font-medium px-3 mb-2">Navigation</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-left",
                isActive
                  ? "bg-[hsl(0_0%_100%)] text-[hsl(232_47%_8%)]"
                  : "text-[hsl(230_15%_72%)] hover:bg-[hsl(232_40%_14%)] hover:text-[hsl(0_0%_100%)]"
              )}
            >
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {item.label}
                <p className={cn(
                  "text-[10px] font-normal leading-tight mt-0.5",
                  isActive ? "text-[hsl(232_47%_8%)]/60" : "text-[hsl(230_15%_40%)]"
                )}>{t(item.descKey)}</p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6 flex flex-col gap-1">
        {/* Profile */}
        <div className="mt-3 pt-3 border-t border-[hsl(232_35%_16%)] flex items-center gap-3 px-3">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[hsl(232_35%_20%)]" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[hsl(232_40%_18%)] border border-[hsl(232_35%_24%)] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[hsl(230_15%_60%)]">{initials || "?"}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[hsl(0_0%_100%)] truncate">{profile.name}</p>
          </div>
          <button className="text-[hsl(230_15%_40%)] hover:text-[hsl(0_0%_100%)] transition-colors flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
