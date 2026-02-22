"use client"

import { Check, X } from "lucide-react"
import { validatePassword, getPasswordStrengthLabel } from "@/lib/password-validation"

export function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null

  const { requirements, score } = validatePassword(password)
  const { label, color } = getPasswordStrengthLabel(score)

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-[hsl(232,35%,20%)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[10px] font-medium min-w-[70px] text-right" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-0.5">
        {requirements.map((req) => (
          <li key={req.label} className="flex items-center gap-1.5 text-[11px]">
            {req.met ? (
              <Check className="w-3 h-3 text-green-400 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-[hsl(230,15%,35%)] shrink-0" />
            )}
            <span className={req.met ? "text-green-400" : "text-[hsl(230,15%,40%)]"}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
