"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLanguage, type TranslationKey } from "@/lib/i18n"

interface TourStep {
  target: string
  mobileTarget?: string
  titleKey: TranslationKey
  descKey: TranslationKey
  placement: "right" | "bottom"
  mobilePlacement?: "right" | "bottom"
}

const TOUR_STEPS: TourStep[] = [
  { target: "sidebar", mobileTarget: "mobile-tabs", titleKey: "tour.step1.title", descKey: "tour.step1.desc", placement: "right", mobilePlacement: "bottom" },
  { target: "stats-cards", titleKey: "tour.step2.title", descKey: "tour.step2.desc", placement: "bottom" },
  { target: "nav-chapters", titleKey: "tour.step3.title", descKey: "tour.step3.desc", placement: "right", mobilePlacement: "bottom" },
  { target: "nav-study-log", titleKey: "tour.step4.title", descKey: "tour.step4.desc", placement: "right", mobilePlacement: "bottom" },
  { target: "nav-review", titleKey: "tour.step5.title", descKey: "tour.step5.desc", placement: "right", mobilePlacement: "bottom" },
]

const STORAGE_KEY = "onboarding-completed"

export function OnboardingTour() {
  const { t } = useLanguage()
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [hole, setHole] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, width: 320 })
  const [visible, setVisible] = useState(false)
  const isMobileRef = useRef(false)
  const positioningRef = useRef(false)

  // Check if tour should show
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed !== "true") {
      const timer = setTimeout(() => setActive(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Track mobile
  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth < 1024 }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Get the target element for a given step
  const getTarget = useCallback((idx: number): HTMLElement | null => {
    const s = TOUR_STEPS[idx]
    const attr = isMobileRef.current && s.mobileTarget ? s.mobileTarget : s.target
    return document.querySelector(`[data-tour="${attr}"]`)
  }, [])

  // Position the spotlight and tooltip around the target element
  const position = useCallback(() => {
    if (!active || positioningRef.current) return
    positioningRef.current = true

    const el = getTarget(step)
    if (!el) {
      positioningRef.current = false
      setVisible(false)
      return
    }

    // Scroll into view if needed, then position after scroll settles
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
    const s = TOUR_STEPS[step]
    const placement = isMobileRef.current && s.mobilePlacement ? s.mobilePlacement : s.placement

    // Hole
    setHole({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })

    // Tooltip
    const tw = Math.min(320, window.innerWidth - 32)
    let top = 0
    let left = 0

    if (placement === "right") {
      top = Math.max(16, rect.top)
      left = rect.right + pad + 16
      // Fall back to bottom if no space on right
      if (left + tw > window.innerWidth - 16) {
        top = rect.bottom + pad + 16
        left = Math.max(16, Math.min(rect.left, window.innerWidth - tw - 16))
      }
    } else {
      top = rect.bottom + pad + 16
      left = Math.max(16, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 16))
    }

    // Clamp to viewport
    if (top + 220 > window.innerHeight) top = Math.max(16, window.innerHeight - 240)

    setTooltipPos({ top, left, width: tw })
    setVisible(true)
    positioningRef.current = false
  }, [active, step, getTarget])

  // Re-position when step changes
  useEffect(() => {
    if (!active) return
    setVisible(false)
    const timer = setTimeout(position, 150)
    return () => clearTimeout(timer)
  }, [active, step, position])

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
  }, [])

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }, [step, finish])

  if (!active) return null

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

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
              <rect
                x={hole.left} y={hole.top}
                width={hole.width} height={hole.height}
                rx={12} ry={12} fill="black"
              />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tour-spotlight)" />
        </svg>
      </div>

      {/* Spotlight ring */}
      {visible && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-xl ring-2 ring-white/40"
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height, transition: "all 300ms" }}
        />
      )}

      {/* Tooltip */}
      {visible && (
        <div
          className="fixed z-[10000] bg-white dark:bg-[hsl(232_47%_12%)] rounded-xl shadow-2xl border border-gray-200 dark:border-[hsl(232_35%_20%)] p-5"
          style={{ top: tooltipPos.top, left: tooltipPos.left, width: tooltipPos.width, transition: "all 300ms" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? "w-6 bg-[hsl(225,50%,22%)] dark:bg-white"
                    : i < step
                      ? "w-1.5 bg-[hsl(225,50%,22%)]/40 dark:bg-white/40"
                      : "w-1.5 bg-gray-200 dark:bg-[hsl(232_35%_24%)]"
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 dark:text-[hsl(230_15%_50%)]">
              {step + 1} {t("tour.stepOf")} {TOUR_STEPS.length}
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
            {t(currentStep.titleKey)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-[hsl(230_15%_65%)] leading-relaxed mb-4">
            {t(currentStep.descKey)}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={finish}
              className="text-xs text-gray-400 dark:text-[hsl(230_15%_45%)] hover:text-gray-600 dark:hover:text-[hsl(230_15%_65%)] transition-colors"
            >
              {t("tour.skip")}
            </button>
            <button
              onClick={next}
              className="px-4 py-2 rounded-lg bg-[hsl(225,50%,22%)] text-white text-sm font-medium hover:bg-[hsl(225,50%,28%)] transition-colors"
            >
              {isLast ? t("tour.finish") : t("tour.next")}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
