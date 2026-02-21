"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLanguage, type TranslationKey } from "@/lib/i18n"

interface TourStep {
  target: string
  titleKey: TranslationKey
  descKey: TranslationKey
  placement: "right" | "bottom" | "left"
}

const TOUR_STEPS: TourStep[] = [
  { target: "sidebar", titleKey: "tour.step1.title", descKey: "tour.step1.desc", placement: "right" },
  { target: "stats-cards", titleKey: "tour.step2.title", descKey: "tour.step2.desc", placement: "bottom" },
  { target: "nav-chapters", titleKey: "tour.step3.title", descKey: "tour.step3.desc", placement: "right" },
  { target: "nav-study-log", titleKey: "tour.step4.title", descKey: "tour.step4.desc", placement: "right" },
  { target: "nav-review", titleKey: "tour.step5.title", descKey: "tour.step5.desc", placement: "right" },
]

// Mobile uses different targets for step 1
const MOBILE_STEP_OVERRIDES: Partial<Record<number, { target: string; placement: "right" | "bottom" | "left" }>> = {
  0: { target: "mobile-tabs", placement: "bottom" },
}

const STORAGE_KEY = "onboarding-completed"

export function OnboardingTour() {
  const { t } = useLanguage()
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({})
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [isMobile, setIsMobile] = useState(false)
  const rafRef = useRef<number>(0)

  // Check if tour should show
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed !== "true") {
      // Small delay so DOM is fully painted
      const timer = setTimeout(() => setActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Position spotlight and tooltip
  const positionElements = useCallback(() => {
    if (!active) return

    const currentStep = TOUR_STEPS[step]
    const override = isMobile ? MOBILE_STEP_OVERRIDES[step] : undefined
    const targetAttr = override?.target ?? currentStep.target
    const placement = override?.placement ?? currentStep.placement

    const el = document.querySelector(`[data-tour="${targetAttr}"]`) as HTMLElement | null
    if (!el) {
      // If target not found (e.g. mobile looking for sidebar), skip to stats-cards
      if (step === 0 && isMobile) {
        const fallback = document.querySelector('[data-tour="mobile-tabs"]') as HTMLElement | null
        if (!fallback) return
      }
      return
    }

    const rect = el.getBoundingClientRect()
    const pad = 8

    // Spotlight position (used for the "hole" in the overlay)
    setSpotlightStyle({
      position: "fixed",
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
      borderRadius: 12,
    })

    // Tooltip position
    const tooltipWidth = Math.min(320, window.innerWidth - 32)
    let top = 0
    let left = 0

    if (placement === "right") {
      top = rect.top + rect.height / 2
      left = rect.right + pad + 12
      // If tooltip goes off-screen right, switch to bottom
      if (left + tooltipWidth > window.innerWidth - 16) {
        top = rect.bottom + pad + 12
        left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
      }
    } else if (placement === "bottom") {
      top = rect.bottom + pad + 12
      left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
    } else if (placement === "left") {
      top = rect.top + rect.height / 2
      left = rect.left - pad - 12 - tooltipWidth
      if (left < 16) {
        top = rect.bottom + pad + 12
        left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
      }
    }

    // Clamp to viewport
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - 16 - tooltipWidth
    }
    if (top < 16) top = 16

    setTooltipStyle({
      position: "fixed",
      top,
      left,
      width: tooltipWidth,
    })
  }, [active, step, isMobile])

  useEffect(() => {
    if (!active) return
    positionElements()

    const onResize = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(positionElements)
    }
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, true)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize, true)
      cancelAnimationFrame(rafRef.current)
    }
  }, [active, positionElements])

  // Lock scroll while active
  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [active])

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

  // Build the spotlight hole via box-shadow
  const sl = spotlightStyle as { top?: number; left?: number; width?: number; height?: number; borderRadius?: number }
  const holeTop = sl.top ?? 0
  const holeLeft = sl.left ?? 0
  const holeW = sl.width ?? 0
  const holeH = sl.height ?? 0
  const holeBR = sl.borderRadius ?? 0

  return (
    <>
      {/* Overlay with spotlight hole */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-auto"
        onClick={finish}
        style={{ background: "transparent" }}
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={holeLeft}
                y={holeTop}
                width={holeW}
                height={holeH}
                rx={holeBR}
                ry={holeBR}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Spotlight border ring */}
      <div
        className="fixed z-[9999] pointer-events-none rounded-xl ring-2 ring-white/40 transition-all duration-300"
        style={{
          top: holeTop,
          left: holeLeft,
          width: holeW,
          height: holeH,
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-white dark:bg-[hsl(232_47%_12%)] rounded-xl shadow-2xl border border-gray-200 dark:border-[hsl(232_35%_20%)] p-5 transition-all duration-300"
        style={tooltipStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Step indicator */}
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

        {/* Content */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
          {t(currentStep.titleKey)}
        </h3>
        <p className="text-sm text-gray-600 dark:text-[hsl(230_15%_65%)] leading-relaxed mb-4">
          {t(currentStep.descKey)}
        </p>

        {/* Actions */}
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
    </>
  )
}
