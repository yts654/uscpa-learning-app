"use client"

import { useState } from "react"
import { type CoverageItem } from "@/lib/analytics-engine"
import { SECTION_INFO, CHAPTER_TITLES_JA, type ExamSection } from "@/lib/study-data"
import { useLanguage } from "@/lib/i18n"
import { useTheme } from "next-themes"
import { Eye, AlertTriangle, HelpCircle, X, ChevronDown, ChevronRight } from "lucide-react"

interface CoverageCardProps {
  items: CoverageItem[]
}

export function CoverageCard({ items }: CoverageCardProps) {
  const { t, locale } = useLanguage()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const redColor = isDark ? "hsl(0, 65%, 65%)" : "hsl(0, 65%, 45%)"
  const [showHelp, setShowHelp] = useState(false)

  // Track collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.coverage.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("analytics.coverage.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          {t("analytics.coverage.noCoverage")}
        </div>
      </div>
    )
  }

  // Group by section
  const grouped: Record<ExamSection, CoverageItem[]> = { FAR: [], AUD: [], REG: [], BEC: [], TCP: [], ISC: [] }
  items.forEach(item => {
    grouped[item.section].push(item)
  })

  const fragile = items.filter(i => i.type === "fragile")
  const untouched = items.filter(i => i.type === "untouched")

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-card-foreground">{t("analytics.coverage.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("analytics.coverage.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {showHelp ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2">
          {fragile.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              {fragile.length} {t("analytics.coverage.fragile")}
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {untouched.length} {t("analytics.coverage.untouched")}
          </span>
        </div>
      </div>

      {showHelp && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border space-y-2">
          <p className="text-xs font-semibold text-card-foreground">
            {t("analytics.coverage.help.title")}
          </p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="font-semibold" style={{ color: redColor }}>{t("analytics.coverage.fragile")}</span> — {t("analytics.coverage.help.fragileDesc")}</p>
            <p><span className="font-semibold text-card-foreground">{t("analytics.coverage.untouched")}</span> — {t("analytics.coverage.help.untouchedDesc")}</p>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
            {t("analytics.coverage.help.footer")}
          </p>
        </div>
      )}

      {/* Inline description */}
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        {t("analytics.coverage.desc")}
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {/* Fragile chapters first */}
        {fragile.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("fragile")}
              className="flex items-center gap-1.5 mb-1.5 w-full text-left group"
            >
              {collapsedSections.has("fragile")
                ? <ChevronRight className="w-3 h-3" style={{ color: redColor }} />
                : <ChevronDown className="w-3 h-3" style={{ color: redColor }} />
              }
              <h4 className="text-[10px] font-bold uppercase tracking-wider group-hover:underline" style={{ color: redColor }}>
                {t("analytics.coverage.fragile")} ({fragile.length})
              </h4>
            </button>
            {!collapsedSections.has("fragile") && (
              <div className="space-y-1">
                {fragile.map(item => (
                  <div key={item.chapterId} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: redColor }} />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: SECTION_INFO[item.section].color }}
                    >
                      {item.section.charAt(0)}
                    </div>
                    <span className="text-xs text-card-foreground truncate flex-1">
                      Ch.{item.chapterNumber} {locale === "ja" ? CHAPTER_TITLES_JA[item.chapterId] || item.chapterTitle : item.chapterTitle}
                    </span>
                    {item.retention !== undefined && (
                      <span className="text-[10px] font-medium" style={{ color: redColor }}>{item.retention}%</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Untouched by section */}
        {(["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).map(section => {
          const sectionItems = grouped[section].filter(i => i.type === "untouched")
          if (sectionItems.length === 0) return null
          const sectionKey = `untouched-${section}`
          const isCollapsed = collapsedSections.has(sectionKey)
          return (
            <div key={section}>
              <button
                onClick={() => toggleSection(sectionKey)}
                className="flex items-center gap-1.5 mb-1.5 w-full text-left group"
              >
                {isCollapsed
                  ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  : <ChevronDown className="w-3 h-3 text-muted-foreground" />
                }
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-[6px] font-bold text-white"
                  style={{ backgroundColor: SECTION_INFO[section].color }}
                >
                  {section.charAt(0)}
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:underline">
                  {section} ({sectionItems.length})
                </h4>
                {sectionItems.some(i => i.urgency === "urgent") && (
                  <span className="text-[8px] font-bold px-1 py-0 rounded bg-[hsl(0,65%,45%)] text-white ml-1">
                    {t("analytics.coverage.urgent")}
                  </span>
                )}
              </button>
              {!isCollapsed && (
                <div className="flex flex-wrap gap-1 ml-5">
                  {sectionItems.map(item => (
                    <span
                      key={item.chapterId}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-border bg-muted/30 text-card-foreground"
                    >
                      Ch.{item.chapterNumber}
                      {item.urgency === "urgent" && (
                        <span className="text-[8px] font-bold px-1 py-0 rounded bg-[hsl(0,65%,45%)] text-white">
                          {t("analytics.coverage.urgent")}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
