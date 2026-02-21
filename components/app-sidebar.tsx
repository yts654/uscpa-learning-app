"use client"

import { LayoutDashboard, BookOpen, BarChart3, ClipboardList, Settings, LogOut, Flame, BookMarked, RefreshCw, FileText, Sun, Moon, Languages, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage, type TranslationKey } from "@/lib/i18n"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"

type View = "dashboard" | "chapters" | "study-log" | "mock-exams" | "analytics" | "settings" | "review"

interface AppSidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  streak: number
  profile: { name: string; photoUrl: string | null }
  collapsed: boolean
  onToggleCollapse: () => void
}

const NAV_ITEMS: { id: View; labelKey: TranslationKey; icon: React.ElementType; descKey: TranslationKey }[] = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, descKey: "nav.dashboard.desc" },
  { id: "chapters", labelKey: "nav.chapters", icon: BookMarked, descKey: "nav.chapters.desc" },
  { id: "study-log", labelKey: "nav.studyLog", icon: ClipboardList, descKey: "nav.studyLog.desc" },
  { id: "mock-exams", labelKey: "nav.mockExams", icon: FileText, descKey: "nav.mockExams.desc" },
  { id: "review", labelKey: "nav.review", icon: RefreshCw, descKey: "nav.review.desc" },
  { id: "analytics", labelKey: "nav.analytics", icon: BarChart3, descKey: "nav.analytics.desc" },
  { id: "settings", labelKey: "nav.settings", icon: Settings, descKey: "nav.settings.desc" },
]

export function AppSidebar({ currentView, onViewChange, streak, profile, collapsed, onToggleCollapse }: AppSidebarProps) {
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
    <aside className={cn(
      "hidden lg:flex flex-col bg-[hsl(232_47%_8%)] text-[hsl(230_15%_82%)] h-screen sticky top-0 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Brand */}
      <div className={cn("flex items-center border-b border-[hsl(232_35%_16%)]", collapsed ? "justify-center px-2 py-6" : "gap-3 px-6 py-6")}>
        <div className="w-9 h-9 rounded-lg bg-[hsl(0_0%_100%)] flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-[hsl(232_47%_8%)]" />
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-lg text-[hsl(0_0%_100%)] leading-tight">CPA Mastery</h1>
              <p className="text-xs text-[hsl(230_15%_50%)] tracking-wide uppercase">{t("sidebar.studyPlatform")}</p>
            </div>
            {/* Quick toggles */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={toggleLocale}
                className="w-7 h-7 rounded-md bg-[hsl(232_40%_14%)] hover:bg-[hsl(232_40%_20%)] flex items-center justify-center transition-colors"
                title={locale === "es" ? t("sidebar.switchToEnglish") : t("sidebar.switchToSpanish")}
              >
                <span className="text-[9px] font-bold text-[hsl(230_15%_72%)]">{locale === "es" ? "EN" : "ES"}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="w-7 h-7 rounded-md bg-[hsl(232_40%_14%)] hover:bg-[hsl(232_40%_20%)] flex items-center justify-center transition-colors"
                title={theme === "dark" ? t("sidebar.lightMode") : t("sidebar.darkMode")}
              >
                {theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5 text-[hsl(40_80%_60%)]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[hsl(230_15%_72%)]" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Streak Badge */}
      {collapsed ? (
        <div className="mx-2 mt-5 mb-2 p-2 rounded-lg bg-gradient-to-b from-[hsl(225,50%,18%)] to-[hsl(175,45%,20%)] border border-[hsl(225,50%,24%)] flex flex-col items-center">
          <Flame className="w-4 h-4 text-[hsl(25,55%,50%)]" />
          <p className="text-lg font-bold text-[hsl(0_0%_100%)] mt-1">{streak}</p>
        </div>
      ) : (
        <div className="mx-4 mt-5 mb-2 p-3 rounded-lg bg-gradient-to-r from-[hsl(225,50%,18%)] to-[hsl(175,45%,20%)] border border-[hsl(225,50%,24%)]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[hsl(25,55%,50%)]" />
            <span className="text-xs font-medium text-[hsl(230_15%_60%)] uppercase tracking-wider">{t("sidebar.studyStreak")}</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(0_0%_100%)] mt-1">{streak} <span className="text-sm font-normal text-[hsl(230_15%_50%)]">{t("sidebar.days")}</span></p>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex flex-col gap-1 mt-4 flex-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-widest text-[hsl(230_15%_40%)] font-medium px-3 mb-2">{t("sidebar.navigation")}</p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? t(item.labelKey) : undefined}
              className={cn(
                "flex rounded-lg font-bold transition-all duration-200",
                collapsed
                  ? "items-center justify-center p-2.5"
                  : "items-start gap-3 px-3 py-2.5 text-sm text-left",
                isActive
                  ? "bg-[hsl(0_0%_100%)] text-[hsl(232_47%_8%)]"
                  : "text-[hsl(230_15%_72%)] hover:bg-[hsl(232_40%_14%)] hover:text-[hsl(0_0%_100%)]"
              )}
            >
              <Icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4 mt-0.5")} />
              {!collapsed && (
                <div>
                  {t(item.labelKey)}
                  <p className={cn(
                    "text-[10px] font-normal leading-tight mt-0.5",
                    isActive ? "text-[hsl(232_47%_8%)]/60" : "text-[hsl(230_15%_40%)]"
                  )}>{t(item.descKey)}</p>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Toggle collapse button */}
      <div className={cn("px-3 mb-2", collapsed && "px-2")}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[hsl(230_15%_50%)] hover:bg-[hsl(232_40%_14%)] hover:text-[hsl(0_0%_100%)] transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-xs">{t("sidebar.collapse")}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className={cn("pb-6 flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
        {/* Profile */}
        <div className={cn(
          "mt-3 pt-3 border-t border-[hsl(232_35%_16%)] flex items-center",
          collapsed ? "justify-center px-1" : "gap-3 px-3"
        )}>
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[hsl(232_35%_20%)]" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[hsl(232_40%_18%)] border border-[hsl(232_35%_24%)] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[hsl(230_15%_60%)]">{initials || "?"}</span>
            </div>
          )}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[hsl(0_0%_100%)] truncate">{profile.name}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-[hsl(230_15%_40%)] hover:text-[hsl(0_0%_100%)] transition-colors flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        {!collapsed && (
          <p className="text-[10px] text-[hsl(230_15%_35%)] text-center mt-3">&copy; 2026 CPA Mastery</p>
        )}
      </div>
    </aside>
  )
}
