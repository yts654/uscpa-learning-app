"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLanguage, type TranslationKey } from "@/lib/i18n"

interface TourStep {
  target: string
  mobileTarget?: string
  titleKey: TranslationKey
  descKey: TranslationKey
  placement: "right" | "bottom" | "left"
  mobilePlacement?: "right" | "bottom" | "left"
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
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rafRef = useRef<number>(0)

  // Check if tour should show
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (completed !== "true") {
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

  // Find the target element for the current step
  const getTargetEl = useCallback((stepIdx: number): HTMLElement | null => {
    const s = TOUR_STEPS[stepIdx]
    const targetAttr = isMobile && s.mobileTarget ? s.mobileTarget : s.target
    return document.querySelector(`[data-tour="${targetAttr}"]`) as HTMLElement | null
  }, [isMobile])

  // Position spotlight and tooltip
  const positionElements = useCallback(() => {
    if (!active) return

    const el = getTargetEl(step)
    if (!el) {
      setReady(false)
      return
    }

    const s = TOUR_STEPS[step]
    const placement = isMobile && s.mobilePlacement ? s.mobilePlacement : s.placement

    // Scroll target into view (the scrollable container is the main content div)
    const scrollContainer = document.querySelector(".flex-1.flex.flex-col.min-w-0.overflow-y-auto")
    if (scrollContainer && scrollContainer.contains(el)) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      // If element is not fully visible in the scroll container, scroll to it
      if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        // Re-position after scroll animation
        setTimeout(() => positionElements(), 400)
        return
      }
    }

    const rect = el.getBoundingClientRect()
    const pad = 8

    // Spotlight hole
    setHole({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })

    // Tooltip position
    const tooltipWidth = Math.min(320, window.innerWidth - 32)
    let top = 0
    let left = 0

    if (placement === "right") {
      top = rect.top + rect.height / 2 - 80
      left = rect.right + pad + 12
      if (left + tooltipWidth > window.innerWidth - 16) {
        top = rect.bottom + pad + 12
        left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
      }
    } else if (placement === "bottom") {
      top = rect.bottom + pad + 12
      left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
    } else if (placement === "left") {
      top = rect.top + rect.height / 2 - 80
      left = rect.left - pad - 12 - tooltipWidth
      if (left < 16) {
        top = rect.bottom + pad + 12
        left = Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2)
      }
    }

    // Clamp
    if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - 16 - tooltipWidth
    if (left < 16) left = 16
    if (top < 16) top = 16
    if (top + 200 > window.innerHeight) top = window.innerHeight - 220

    setTooltipPos({ top, left, width: tooltipWidth })
    setReady(true)
  }, [active, step, isMobile, getTargetEl])

  // Re-position on step change, resize, scroll
  useEffect(() => {
    if (!active) return
    setReady(false)
    // Small delay to let DOM update (e.g. after scrollIntoView)
    const timer = setTimeout(positionElements, 100)

    const onResize = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(positionElements)
    }
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize, true)
      cancelAnimationFrame(rafRef.current)
    }
  }, [active, positionElements])

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setActive(false)
    document.body.style.overflow = ""
  }, [])

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }, [step, finish])

  // Lock scroll on the body but allow scroll container to scroll for scrollIntoView
  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden"
      // Allow the main content scroll container to scroll for positioning
      const scrollContainer = document.querySelector(".flex-1.flex.flex-col.min-w-0.overflow-y-auto") as HTMLElement | null
      if (scrollContainer) {
        scrollContainer.style.overflow = "auto"
      }
      return () => {
        document.body.style.overflow = ""
        if (scrollContainer) {
          scrollContainer.style.overflow = ""
        }
      }
    }
  }, [active])

  if (!active) return null

  const currentStep = TOUR_STEPS[step]
  const isLast = step === TOUR_STEPS.length - 1

  return (
    <>
      {/* Overlay with spotlight hole */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-auto"
        onClick={finish}
        style={{ opacity: ready ? 1 : 0, transition: "opacity 200ms" }}
      >
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={hole.left}
                y={hole.top}
                width={hole.width}
                height={hole.height}
                rx={12}
                ry={12}
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
      {ready && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-xl ring-2 ring-white/40"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            transition: "all 300ms ease",
          }}
        />
      )}

      {/* Tooltip */}
      {ready && (
        <div
          className="fixed z-[10000] bg-white dark:bg-[hsl(232_47%_12%)] rounded-xl shadow-2xl border border-gray-200 dark:border-[hsl(232_35%_20%)] p-5"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: tooltipPos.width,
            transition: "all 300ms ease",
          }}
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
      )}
    </>
  )
}
