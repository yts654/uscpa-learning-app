"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLanguage, type TranslationKey } from "@/lib/i18n"

type View = "dashboard" | "chapters" | "study-log" | "mock-exams" | "analytics" | "settings" | "review"

interface TourStep {
  target: string
  view: View
  titleKey: TranslationKey
  descKey: TranslationKey
  placement: "bottom" | "center"
}

const TOUR_STEPS: TourStep[] = [
  { view: "dashboard", target: "",            titleKey: "tour.step1.title", descKey: "tour.step1.desc", placement: "center" },
  { view: "dashboard", target: "stats-cards", titleKey: "tour.step2.title", descKey: "tour.step2.desc", placement: "bottom" },
  { view: "chapters",  target: "",            titleKey: "tour.step3.title", descKey: "tour.step3.desc", placement: "center" },
  { view: "study-log", target: "",            titleKey: "tour.step4.title", descKey: "tour.step4.desc", placement: "center" },
  { view: "mock-exams",target: "",            titleKey: "tour.step5.title", descKey: "tour.step5.desc", placement: "center" },
  { view: "review",    target: "",            titleKey: "tour.step6.title", descKey: "tour.step6.desc", placement: "center" },
  { view: "analytics", target: "",            titleKey: "tour.step7.title", descKey: "tour.step7.desc", placement: "center" },
  { view: "settings",  target: "",            titleKey: "tour.step8.title", descKey: "tour.step8.desc", placement: "center" },
  { view: "dashboard", target: "",            titleKey: "tour.step9.title", descKey: "tour.step9.desc", placement: "center" },
]

const STORAGE_KEY = "onboarding-tour-v4"

interface OnboardingTourProps {
  onViewChange: (view: View) => void
  externalStart?: boolean
  onTourEnd?: () => void
}

export function OnboardingTour({ onViewChange, externalStart, onTourEnd }: OnboardingTourProps) {
  const { t } = useLanguage()
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [hole, setHole] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, width: 360 })
  const [visible, setVisible] = useState(false)
  const positioningRef = useRef(false)
  const prevExternalStart = useRef(false)

  // Auto-start on first visit
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed !== "true") {
      const timer = setTimeout(() => {
        setActive(true)
        setStep(0)
        onViewChange("dashboard")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // External trigger (from "Take the Tour" button)
  useEffect(() => {
    if (externalStart && !prevExternalStart.current) {
      setStep(0)
      setActive(true)
      onViewChange("dashboard")
    }
    prevExternalStart.current = !!externalStart
  }, [externalStart]) // eslint-disable-line react-hooks/exhaustive-deps

  const isCenterStep = useCallback((idx: number): boolean => {
    return !TOUR_STEPS[idx].target
  }, [])

  const getTarget = useCallback((idx: number): HTMLElement | null => {
    const s = TOUR_STEPS[idx]
    if (!s.target) return null
    return document.querySelector(`[data-tour="${s.target}"]`)
  }, [])

  const position = useCallback(() => {
    if (!active || positioningRef.current) return
    positioningRef.current = true

    if (isCenterStep(step)) {
      const tw = Math.min(400, window.innerWidth - 32)
      setHole({ top: 0, left: 0, width: 0, height: 0 })
      setTooltipPos({
        top: Math.max(16, window.innerHeight / 2 - 160),
        left: Math.max(16, window.innerWidth / 2 - tw / 2),
        width: tw,
      })
      setVisible(true)
      positioningRef.current = false
      return
    }

    const el = getTarget(step)
    if (!el) {
      positioningRef.current = false
      setVisible(false)
      return
    }

    const rect = el.getBoundingClientRect()
    const inViewport = rect.top >= 0 && rect.bottom <= window.innerHeight
    if (!inViewport) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setTimeout(() => {
        positioningRef.current = false
        position()
      }, 500)
      return
    }

    const pad = 8
    setHole({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })

    const tw = Math.min(400, window.innerWidth - 32)
    let top = rect.bottom + pad + 16
    let left = Math.max(16, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 16))
    if (top + 280 > window.innerHeight) top = Math.max(16, rect.top - pad - 280)

    setTooltipPos({ top, left, width: tw })
    setVisible(true)
    positioningRef.current = false
  }, [active, step, getTarget, isCenterStep])

  // Re-position on step change
  useEffect(() => {
    if (!active) return
    setVisible(false)
    // Navigate to the correct view for this step
    const targetView = TOUR_STEPS[step].view
    onViewChange(targetView)
    // Wait for DOM to update after view change, then position
    const timer = setTimeout(position, 350)
    return () => clearTimeout(timer)
  }, [active, step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-position on resize
  useEffect(() => {
    if (!active) return
    const handler = () => {
      setVisible(false)
      setTimeout(position, 100)
    }
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [active, position])

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setActive(false)
    onViewChange("dashboard")
    onTourEnd?.()
  }, [onViewChange, onTourEnd])

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }, [step, finish])

  const prev = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }, [step])

  if (!active) return null

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1
  const isFirst = step === 0
  const isCenter = isCenterStep(step)

  // Render description with line breaks
  const descText = t(currentStep.descKey)
  const descLines = descText.split("\n")

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={finish}
        style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms", pointerEvents: visible ? "auto" : "none" }}
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-spotlight">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {!isCenter && (
                <rect
                  x={hole.left} y={hole.top}
                  width={hole.width} height={hole.height}
                  rx={12} ry={12} fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill={isCenter ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.6)"} mask="url(#tour-spotlight)" />
        </svg>
      </div>

      {/* Spotlight ring */}
      {visible && !isCenter && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-xl ring-2 ring-white/40"
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height, transition: "all 300ms" }}
        />
      )}

      {/* Tooltip */}
      {visible && (
        <div
          className="fixed z-[10000] bg-white dark:bg-[hsl(232_47%_12%)] rounded-xl shadow-2xl border border-gray-200 dark:border-[hsl(232_35%_20%)] p-5 max-h-[80vh] overflow-y-auto"
          style={{ top: tooltipPos.top, left: tooltipPos.left, width: tooltipPos.width, transition: "all 300ms" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? "w-4 bg-[hsl(225,50%,22%)] dark:bg-white"
                    : i < step
                      ? "w-1.5 bg-[hsl(225,50%,22%)]/40 dark:bg-white/40"
                      : "w-1.5 bg-gray-200 dark:bg-[hsl(232_35%_24%)]"
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 dark:text-[hsl(230_15%_50%)] flex-shrink-0">
              {step + 1} {t("tour.stepOf")} {TOUR_STEPS.length}
            </span>
          </div>

          {/* Page indicator */}
          {currentStep.view !== "dashboard" && (
            <div className="inline-block px-2 py-0.5 rounded-md bg-[hsl(225,50%,22%)]/10 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-[hsl(225,50%,22%)] dark:text-white/70 mb-2">
              {currentStep.view.replace("-", " ")}
            </div>
          )}

          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            {t(currentStep.titleKey)}
          </h3>
          <div className="text-sm text-gray-600 dark:text-[hsl(230_15%_65%)] leading-relaxed mb-4 space-y-1">
            {descLines.map((line, i) => {
              if (line.startsWith("• ")) {
                return (
                  <div key={i} className="flex items-start gap-2 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(225,50%,22%)] dark:bg-white/50 mt-1.5 flex-shrink-0" />
                    <span>{line.slice(2)}</span>
                  </div>
                )
              }
              return <p key={i}>{line}</p>
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={finish}
              className="text-xs text-gray-400 dark:text-[hsl(230_15%_45%)] hover:text-gray-600 dark:hover:text-[hsl(230_15%_65%)] transition-colors"
            >
              {t("tour.skip")}
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={prev}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-[hsl(230_15%_55%)] hover:bg-gray-100 dark:hover:bg-[hsl(232_35%_18%)] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="px-4 py-2 rounded-lg bg-[hsl(225,50%,22%)] text-white text-sm font-medium hover:bg-[hsl(225,50%,28%)] transition-colors"
              >
                {isLast ? t("tour.finish") : t("tour.next")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
