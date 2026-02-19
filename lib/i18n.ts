"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import React from "react"

export type Locale = "en" | "es"

const translations = {
  // Nav descriptions
  "nav.dashboard.desc": {
    en: "Overview of your study progress",
    es: "Resumen de tu progreso de estudio",
  },
  "nav.chapters.desc": {
    en: "Select a chapter to start studying",
    es: "Selecciona un capítulo para empezar a estudiar",
  },
  "nav.studyLog.desc": {
    en: "View and add study records",
    es: "Ver y agregar registros de estudio",
  },
  "nav.review.desc": {
    en: "Spaced repetition review schedule",
    es: "Calendario de repaso con repetición espaciada",
  },
  "nav.analytics.desc": {
    en: "Performance analysis and trends",
    es: "Análisis de rendimiento y tendencias",
  },
  "nav.settings.desc": {
    en: "Profile and configuration",
    es: "Perfil y configuración",
  },

  // Dashboard guide
  "guide.title": {
    en: "How to use",
    es: "Cómo usar",
  },
  "guide.step1.title": {
    en: "Select a chapter in Chapters",
    es: "Selecciona un capítulo en Chapters",
  },
  "guide.step1.desc": {
    en: "Choose a chapter to study",
    es: "Elige un capítulo para estudiar",
  },
  "guide.step2.title": {
    en: "Record your Study Log",
    es: "Registra tu Study Log",
  },
  "guide.step2.desc": {
    en: "Add study records from the chapter detail page",
    es: "Agrega registros de estudio desde la página de detalle del capítulo",
  },
  "guide.step3.title": {
    en: "Check your Review schedule",
    es: "Consulta tu calendario de Review",
  },
  "guide.step3.desc": {
    en: "Optimal review timing based on the forgetting curve",
    es: "Momento óptimo de repaso basado en la curva del olvido",
  },
  "guide.openChapters": {
    en: "Open Chapters",
    es: "Abrir Chapters",
  },

  // Dashboard empty state
  "dashboard.empty.noSessions": {
    en: "No study sessions recorded yet.",
    es: "Aún no hay sesiones de estudio registradas.",
  },
  "dashboard.empty.startStudying": {
    en: "Select a chapter from Chapters to start your first study session.",
    es: "Selecciona un capítulo en Chapters para comenzar tu primera sesión de estudio.",
  },
  "dashboard.empty.openChapters": {
    en: "Open Chapters",
    es: "Abrir Chapters",
  },
  "dashboard.section.noSessions": {
    en: "No study sessions yet for this section.",
    es: "Aún no hay sesiones de estudio para esta sección.",
  },
  "dashboard.section.startStudying": {
    en: "Open a chapter in this section to start studying.",
    es: "Abre un capítulo en esta sección para empezar a estudiar.",
  },
  "dashboard.section.openChapters": {
    en: "Open chapters",
    es: "Abrir capítulos",
  },

  // Review criteria panel
  "review.criteria.title": {
    en: "Review Schedule Criteria",
    es: "Criterios del calendario de repaso",
  },
  "review.criteria.intervals.title": {
    en: "Review Intervals",
    es: "Intervalos de repaso",
  },
  "review.criteria.intervals.desc": {
    en: "The interval until the next review increases with each review",
    es: "El intervalo hasta el próximo repaso aumenta con cada repaso",
  },
  "review.criteria.intervals.1st": { en: "1st", es: "1.°" },
  "review.criteria.intervals.2nd": { en: "2nd", es: "2.°" },
  "review.criteria.intervals.3rd": { en: "3rd", es: "3.°" },
  "review.criteria.intervals.4th": { en: "4th", es: "4.°" },
  "review.criteria.intervals.5th": { en: "5th+", es: "5.°+" },
  "review.criteria.intervals.1d": { en: "after 1 day", es: "después de 1 día" },
  "review.criteria.intervals.3d": { en: "after 3 days", es: "después de 3 días" },
  "review.criteria.intervals.7d": { en: "after 7 days", es: "después de 7 días" },
  "review.criteria.intervals.14d": { en: "after 14 days", es: "después de 14 días" },
  "review.criteria.intervals.30d": { en: "after 30 days+", es: "después de 30 días+" },

  // Alert criteria
  "review.criteria.alerts.title": {
    en: "Alert Criteria",
    es: "Criterios de alerta",
  },
  "review.criteria.alerts.desc": {
    en: "Retention is calculated automatically from review count and elapsed days",
    es: "La retención se calcula automáticamente a partir del número de repasos y los días transcurridos",
  },
  "review.criteria.alerts.overdue.label": {
    en: "Overdue — Retention below 30%",
    es: "Vencido — Retención por debajo del 30%",
  },
  "review.criteria.alerts.overdue.desc": {
    en: "Memory has significantly faded. Review immediately.",
    es: "La memoria se ha debilitado significativamente. Repasa de inmediato.",
  },
  "review.criteria.alerts.dueToday.label": {
    en: "Due Today — Next review date is today or earlier",
    es: "Para hoy — La próxima fecha de repaso es hoy o anterior",
  },
  "review.criteria.alerts.dueToday.desc": {
    en: "Scheduled review timing has arrived.",
    es: "Ha llegado el momento programado de repaso.",
  },
  "review.criteria.alerts.comingUp.label": {
    en: "Coming Up — Review due within 7 days",
    es: "Próximamente — Repaso dentro de 7 días",
  },
  "review.criteria.alerts.comingUp.desc": {
    en: "Review timing is approaching soon.",
    es: "El momento de repaso se acerca pronto.",
  },

  // Mastery levels
  "review.criteria.mastery.title": {
    en: "Mastery Levels",
    es: "Niveles de dominio",
  },
  "review.criteria.mastery.new": { en: "Not studied", es: "No estudiado" },
  "review.criteria.mastery.learning": { en: "1-2 reviews", es: "1-2 repasos" },
  "review.criteria.mastery.reviewing": {
    en: "3-4 reviews or 5+ with retention ≤50%",
    es: "3-4 repasos o 5+ con retención ≤50%",
  },
  "review.criteria.mastery.mastered": {
    en: "5+ reviews and retention >50%",
    es: "5+ repasos y retención >50%",
  },

  // Retention colors
  "review.criteria.retention.title": {
    en: "Retention Color Scale",
    es: "Escala de colores de retención",
  },
  "review.criteria.retention.stable": { en: "Stable", es: "Estable" },
  "review.criteria.retention.good": { en: "Good", es: "Bueno" },
  "review.criteria.retention.caution": { en: "Caution", es: "Precaución" },
  "review.criteria.retention.needsReview": { en: "Needs review", es: "Necesita repaso" },

  // Review alerts
  "review.alert.title": {
    en: "Review Alert",
    es: "Alerta de repaso",
  },
  "review.alert.retention": {
    en: "Retention",
    es: "Retención",
  },
  "review.alert.daysAgo": {
    en: "days ago",
    es: "días atrás",
  },
  "review.alert.overdue": {
    en: "Needs review",
    es: "Necesita repaso",
  },
  "review.alert.dueToday": {
    en: "Review today",
    es: "Repasar hoy",
  },

  // Review chart
  "review.chart.title": {
    en: "Forgetting Curve — Per Chapter",
    es: "Curva del olvido — Por capítulo",
  },
  "review.chart.selectedDesc": {
    en: "'s forgetting curve",
    es: " — curva del olvido",
  },
  "review.chart.defaultDesc": {
    en: "Select a chapter to view its individual curve",
    es: "Selecciona un capítulo para ver su curva individual",
  },
  "review.chart.xLabel": {
    en: "Days elapsed",
    es: "Días transcurridos",
  },
  "review.chart.currentCurve": {
    en: "Current curve",
    es: "Curva actual",
  },
  "review.chart.nextCurve": {
    en: "Predicted after next review",
    es: "Predicción después del próximo repaso",
  },
  "review.chart.daysSuffix": {
    en: " days elapsed",
    es: " días transcurridos",
  },
  "review.chart.currentPosition": {
    en: "Current position",
    es: "Posición actual",
  },

  // Review detail labels
  "review.detail.retention": {
    en: "Retention",
    es: "Retención",
  },
  "review.detail.reviewCount": {
    en: "Review Count",
    es: "Número de repasos",
  },
  "review.detail.reviewCountUnit": {
    en: "times",
    es: "veces",
  },
  "review.detail.lastStudied": {
    en: "Last Studied",
    es: "Último estudio",
  },
  "review.detail.daysAgoUnit": {
    en: " days ago",
    es: " días atrás",
  },
  "review.detail.nextReview": {
    en: "Next Review",
    es: "Próximo repaso",
  },
  "review.detail.reviewsSuffix": {
    en: " reviews",
    es: " repasos",
  },

  // Review header
  "review.header.desc": {
    en: "Based on the Ebbinghaus forgetting curve. Chapters are ranked by memory retention — review overdue items first to maximize long-term recall.",
    es: "Basado en la curva del olvido de Ebbinghaus. Los capítulos se ordenan por retención de memoria — repasa primero los vencidos para maximizar la retención a largo plazo.",
  },

  // Review urgency groups
  "review.group.overdue.desc": {
    en: "Retention below 30% — review immediately",
    es: "Retención por debajo del 30% — repasa de inmediato",
  },
  "review.group.dueToday.desc": {
    en: "Scheduled for review today",
    es: "Programado para repasar hoy",
  },
  "review.group.comingUp.desc": {
    en: "Due within the next 7 days",
    es: "Pendiente en los próximos 7 días",
  },
  "review.group.wellRetained.desc": {
    en: "Retention above 70% — no rush",
    es: "Retención por encima del 70% — sin prisa",
  },
  "review.group.notStudied.desc": {
    en: "Start studying to begin tracking retention",
    es: "Comienza a estudiar para empezar a rastrear la retención",
  },

  // Mock Exams — nav
  "nav.mockExams.desc": {
    en: "Track mock exam scores by section",
    es: "Registra las puntuaciones de simulacros por sección",
  },

  // Mock Exams — header
  "mockExams.title": {
    en: "Mock Exams",
    es: "Simulacros",
  },
  "mockExams.subtitle": {
    en: "Track your mock exam results across all sections",
    es: "Registra los resultados de tus simulacros en todas las secciones",
  },

  // Mock Exams — form
  "mockExams.form.addResult": {
    en: "Add Result",
    es: "Agregar resultado",
  },
  "mockExams.form.date": {
    en: "Date",
    es: "Fecha",
  },
  "mockExams.form.section": {
    en: "Section",
    es: "Sección",
  },
  "mockExams.form.source": {
    en: "Source",
    es: "Fuente",
  },
  "mockExams.form.sourcePlaceholder": {
    en: "e.g. Becker, Wiley, Roger CPA...",
    es: "ej. Becker, Wiley, Roger CPA...",
  },
  "mockExams.form.mcQuestions": {
    en: "MC Questions",
    es: "Preguntas MC",
  },
  "mockExams.form.mcCorrect": {
    en: "MC Correct",
    es: "MC correctas",
  },
  "mockExams.form.tbsQuestions": {
    en: "TBS Questions",
    es: "Preguntas TBS",
  },
  "mockExams.form.tbsCorrect": {
    en: "TBS Correct",
    es: "TBS correctas",
  },
  "mockExams.form.total": {
    en: "Total",
    es: "Total",
  },
  "mockExams.form.accuracy": {
    en: "Accuracy",
    es: "Precisión",
  },
  "mockExams.form.memo": {
    en: "Memo",
    es: "Notas",
  },
  "mockExams.form.memoPlaceholder": {
    en: "Notes about this exam...",
    es: "Notas sobre este examen...",
  },
  "mockExams.form.submit": {
    en: "Save Result",
    es: "Guardar resultado",
  },
  "mockExams.form.cancel": {
    en: "Cancel",
    es: "Cancelar",
  },
  "mockExams.form.validationError": {
    en: "Correct answers cannot exceed total questions",
    es: "Las respuestas correctas no pueden superar el total de preguntas",
  },

  // Mock Exams — summary cards
  "mockExams.summary.bestScore": {
    en: "Best Score",
    es: "Mejor puntuación",
  },
  "mockExams.summary.latestScore": {
    en: "Latest Score",
    es: "Última puntuación",
  },
  "mockExams.summary.attempts": {
    en: "Attempts",
    es: "Intentos",
  },
  "mockExams.summary.noData": {
    en: "No data",
    es: "Sin datos",
  },

  // Mock Exams — chart
  "mockExams.chart.title": {
    en: "Score Trend",
    es: "Tendencia de puntuación",
  },
  "mockExams.chart.accuracy": {
    en: "Accuracy (%)",
    es: "Precisión (%)",
  },
  "mockExams.chart.noData": {
    en: "No chart data yet. Add mock exam results to see trends.",
    es: "Aún no hay datos del gráfico. Agrega resultados de simulacros para ver tendencias.",
  },

  // Mock Exams — results
  "mockExams.results.title": {
    en: "Results",
    es: "Resultados",
  },
  "mockExams.results.empty": {
    en: "No mock exam results yet. Click \"Add Result\" to record your first exam.",
    es: "Aún no hay resultados de simulacros. Haz clic en \"Agregar resultado\" para registrar tu primer examen.",
  },
  "mockExams.results.delete": {
    en: "Delete",
    es: "Eliminar",
  },
  "mockExams.results.mc": {
    en: "MC",
    es: "MC",
  },
  "mockExams.results.tbs": {
    en: "TBS",
    es: "TBS",
  },

  // Mock Exams — filter
  "mockExams.filter.all": {
    en: "All",
    es: "Todos",
  },

  // Review — summary strip labels
  "review.summary.studied": { en: "Studied", es: "Estudiado" },
  "review.summary.overdue": { en: "Overdue", es: "Vencido" },
  "review.summary.avgRetention": { en: "Avg Retention", es: "Retención prom." },
  "review.summary.mastered": { en: "Mastered", es: "Dominado" },

  // Review — urgency group labels
  "review.group.overdue.label": { en: "Overdue", es: "Vencido" },
  "review.group.dueToday.label": { en: "Due Today", es: "Para hoy" },
  "review.group.comingUp.label": { en: "Coming Up", es: "Próximamente" },
  "review.group.wellRetained.label": { en: "Well Retained", es: "Bien retenido" },
  "review.group.notStudied.label": { en: "Not Yet Studied", es: "Aún no estudiado" },

  // Review — alert section
  "review.alert.needsReview": { en: "Needs review", es: "Necesita repaso" },
  "review.alert.reviewToday": { en: "Review today", es: "Repasar hoy" },

  // Dashboard — review queue
  "dashboard.reviewQueue.title": { en: "Review Queue", es: "Cola de repaso" },
  "dashboard.reviewQueue.desc": {
    en: "Chapters needing review based on forgetting curve",
    es: "Capítulos que necesitan repaso según la curva del olvido",
  },
  "dashboard.reviewQueue.viewSchedule": { en: "View Schedule", es: "Ver calendario" },

  // Dashboard — sections
  "dashboard.sections.title": { en: "Exam Sections", es: "Secciones del examen" },
  "dashboard.sections.viewAll": { en: "View All Chapters", es: "Ver todos los capítulos" },
  "dashboard.recentActivity.title": { en: "Recent Activity", es: "Actividad reciente" },
  "dashboard.recentActivity.viewLog": { en: "View Study Log", es: "Ver registro de estudio" },

  // Settings language
  "settings.language": {
    en: "Language",
    es: "Idioma",
  },

  // ── Analytics ─────────────────────────────────────────────────
  "analytics.title": { en: "Analytics", es: "Analíticas" },
  "analytics.subtitle": {
    en: "Strategic insights to guide your study decisions.",
    es: "Información estratégica para guiar tus decisiones de estudio.",
  },

  // Pace Engine
  "analytics.pace.title": { en: "Goal Pace", es: "Ritmo del objetivo" },
  "analytics.pace.subtitle": {
    en: "Required vs actual weekly pace toward your exam date",
    es: "Ritmo semanal requerido vs real hacia tu fecha de examen",
  },
  "analytics.pace.remaining": { en: "Remaining", es: "Restante" },
  "analytics.pace.chapters": { en: "chapters", es: "capítulos" },
  "analytics.pace.estimatedHours": { en: "Est. hours left", es: "Horas est. restantes" },
  "analytics.pace.weeklyRequired": { en: "Weekly required", es: "Requerido semanal" },
  "analytics.pace.weeklyActual": { en: "Weekly actual", es: "Real semanal" },
  "analytics.pace.eta": { en: "ETA", es: "Fecha est." },
  "analytics.pace.delay": { en: "Delay", es: "Retraso" },
  "analytics.pace.onTrack": { en: "On track", es: "En camino" },
  "analytics.pace.ahead": { en: "Ahead of schedule", es: "Adelantado" },
  "analytics.pace.behind": { en: "Behind schedule", es: "Atrasado" },
  "analytics.pace.noGoal": {
    en: "Set an exam date in Settings to see pace analysis.",
    es: "Establece una fecha de examen en Settings para ver el análisis de ritmo.",
  },
  "analytics.pace.hPerWeek": { en: "h/week", es: "h/semana" },
  "analytics.pace.days": { en: "days", es: "días" },
  "analytics.pace.weeksLeft": { en: "weeks left", es: "semanas restantes" },

  // Risk Radar
  "analytics.risk.title": { en: "Risk Radar", es: "Radar de riesgos" },
  "analytics.risk.subtitle": {
    en: "Potential issues that may affect your progress",
    es: "Problemas potenciales que pueden afectar tu progreso",
  },
  "analytics.risk.noRisks": {
    en: "No risks detected. Keep up the good work!",
    es: "No se detectaron riesgos. ¡Sigue así!",
  },
  "analytics.risk.critical": { en: "Critical", es: "Crítico" },
  "analytics.risk.warning": { en: "Warning", es: "Advertencia" },
  "analytics.risk.info": { en: "Info", es: "Info" },
  "analytics.risk.reviewDebt": { en: "Review Debt", es: "Deuda de repaso" },
  "analytics.risk.cramming": { en: "Cramming Risk", es: "Riesgo de atracón" },
  "analytics.risk.stagnation": { en: "Stagnation", es: "Estancamiento" },
  "analytics.risk.untouched": { en: "Untouched Chapters", es: "Capítulos sin tocar" },
  "analytics.risk.variance": { en: "Study Variance", es: "Variación de estudio" },

  // Retention Calibration
  "analytics.retention.title": { en: "Retention Calibration", es: "Calibración de retención" },
  "analytics.retention.subtitle": {
    en: "Predicted vs actual recall — calibrate your review intervals",
    es: "Recuerdo predicho vs real — calibra tus intervalos de repaso",
  },
  "analytics.retention.predicted": { en: "Predicted", es: "Predicho" },
  "analytics.retention.actual": { en: "Actual", es: "Real" },
  "analytics.retention.gap": { en: "Gap", es: "Brecha" },
  "analytics.retention.action": { en: "Action", es: "Acción" },
  "analytics.retention.shortenInterval": { en: "Shorten interval", es: "Acortar intervalo" },
  "analytics.retention.extendInterval": { en: "Extend interval", es: "Extender intervalo" },
  "analytics.retention.onTrack": { en: "On track", es: "En camino" },
  "analytics.retention.noData": {
    en: "Rate your recall in the Review tab to see calibration data.",
    es: "Califica tu recuerdo en la pestaña Review para ver datos de calibración.",
  },

  // Allocation Optimizer
  "analytics.allocation.title": { en: "Weekly Strategy", es: "Estrategia semanal" },
  "analytics.allocation.subtitle": {
    en: "Recommended time allocation adjustments",
    es: "Ajustes recomendados de distribución de tiempo",
  },
  "analytics.allocation.section": { en: "Section", es: "Sección" },
  "analytics.allocation.current": { en: "Current", es: "Actual" },
  "analytics.allocation.recommended": { en: "Recommended", es: "Recomendado" },
  "analytics.allocation.change": { en: "Change", es: "Cambio" },
  "analytics.allocation.reason": { en: "Reason", es: "Razón" },
  "analytics.allocation.increase": { en: "Increase", es: "Aumentar" },
  "analytics.allocation.decrease": { en: "Decrease", es: "Disminuir" },
  "analytics.allocation.maintain": { en: "Maintain", es: "Mantener" },

  // Coverage
  "analytics.coverage.title": { en: "Coverage Gaps", es: "Brechas de cobertura" },
  "analytics.coverage.subtitle": {
    en: "Untouched and fragile chapters requiring attention",
    es: "Capítulos sin tocar y frágiles que requieren atención",
  },
  "analytics.coverage.untouched": { en: "Untouched", es: "Sin tocar" },
  "analytics.coverage.fragile": { en: "Fragile", es: "Frágil" },
  "analytics.coverage.urgent": { en: "Urgent", es: "Urgente" },
  "analytics.coverage.normal": { en: "Normal", es: "Normal" },
  "analytics.coverage.noCoverage": {
    en: "All chapters are covered. Great job!",
    es: "Todos los capítulos están cubiertos. ¡Excelente trabajo!",
  },

  // Drill-Down
  "analytics.drilldown.title": { en: "Chapter Detail", es: "Detalle del capítulo" },
  "analytics.drilldown.subtitle": {
    en: "Accuracy trend per chapter over time",
    es: "Tendencia de precisión por capítulo a lo largo del tiempo",
  },

  // ── Review Recall Rating ──────────────────────────────────────
  "review.recall.title": { en: "How well did you recall?", es: "¿Qué tan bien recordaste?" },
  "review.recall.0": { en: "Forgot", es: "Olvidé" },
  "review.recall.1": { en: "Hard", es: "Difícil" },
  "review.recall.2": { en: "OK", es: "OK" },
  "review.recall.3": { en: "Easy", es: "Fácil" },
  "review.recall.rated": { en: "Rated", es: "Calificado" },
} as const

export type TranslationKey = keyof typeof translations

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("app-locale") as Locale | null
    if (saved === "en" || saved === "es") {
      setLocaleState(saved)
    }
    setMounted(true)
  }, [])

  // Sync <html lang="..."> with locale
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale
    }
  }, [locale, mounted])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("app-locale", newLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key]
      if (!entry) return key
      return entry[locale] || entry.en
    },
    [locale]
  )

  // Avoid hydration mismatch by rendering with default locale until mounted
  const contextValue = {
    locale: mounted ? locale : "en",
    setLocale,
    t: mounted
      ? t
      : (key: TranslationKey) => {
          const entry = translations[key]
          return entry ? entry.en : key
        },
  }

  return React.createElement(LanguageContext.Provider, { value: contextValue }, children)
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
