"use client"

import { useLanguage } from "@/lib/i18n"

interface UsageBadgeProps {
  used: number
  limit: number
  plan: "free" | "pro"
}

export function UsageBadge({ used, limit, plan }: UsageBadgeProps) {
  const { t } = useLanguage()
  const remaining = Math.max(0, limit - used)
  const percentage = limit > 0 ? (used / limit) * 100 : 0
  const isLow = remaining <= 3 && remaining > 0
  const isExhausted = remaining === 0

  return (
    <div className="flex items-center gap-2">
      {plan === "pro" && (
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          PRO
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isExhausted ? "bg-destructive" : isLow ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <span className={`text-[10px] font-medium ${
          isExhausted ? "text-destructive" : isLow ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
        }`}>
          {remaining}/{limit} {t("usage.remaining")}
        </span>
      </div>
    </div>
  )
}
