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
  "guide.startTour": {
    en: "Take the Tour",
    es: "Iniciar el recorrido",
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
    en: "Track practice exam scores by section",
    es: "Registra las puntuaciones de exámenes de práctica por sección",
  },

  // Mock Exams — header
  "mockExams.title": {
    en: "Practice Exam",
    es: "Examen de práctica",
  },
  "mockExams.subtitle": {
    en: "Track your practice exam results across all sections",
    es: "Registra los resultados de tus exámenes de práctica en todas las secciones",
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
  "mockExams.form.selectSource": {
    en: "Select provider...",
    es: "Seleccionar proveedor...",
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
    en: "No chart data yet. Add practice exam results to see trends.",
    es: "Aún no hay datos del gráfico. Agrega resultados de exámenes de práctica para ver tendencias.",
  },

  // Mock Exams — results
  "mockExams.results.title": {
    en: "Results",
    es: "Resultados",
  },
  "mockExams.results.empty": {
    en: "No practice exam results yet. Click \"Add Result\" to record your first exam.",
    es: "Aún no hay resultados de exámenes de práctica. Haz clic en \"Agregar resultado\" para registrar tu primer examen.",
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

  // ── Sidebar / Mobile Header ─────────────────────────────────────
  "nav.dashboard": { en: "Dashboard", es: "Panel" },
  "nav.chapters": { en: "Chapters", es: "Capítulos" },
  "nav.studyLog": { en: "Study Log", es: "Registro" },
  "nav.mockExams": { en: "Practice Exam", es: "Examen de práctica" },
  "nav.review": { en: "Review", es: "Repaso" },
  "nav.analytics": { en: "Analytics", es: "Analíticas" },
  "nav.settings": { en: "Settings", es: "Ajustes" },
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.log": { en: "Log", es: "Registro" },
  "nav.mock": { en: "Practice", es: "Práctica" },
  "sidebar.studyPlatform": { en: "Study Platform", es: "Plataforma de estudio" },
  "sidebar.studyStreak": { en: "Study Streak", es: "Racha de estudio" },
  "sidebar.days": { en: "days", es: "días" },
  "sidebar.collapse": { en: "Collapse", es: "Colapsar" },
  "sidebar.navigation": { en: "Navigation", es: "Navegación" },
  "sidebar.switchToEnglish": { en: "Switch to English", es: "Cambiar a inglés" },
  "sidebar.switchToSpanish": { en: "Switch to Spanish", es: "Cambiar a español" },
  "sidebar.lightMode": { en: "Light mode", es: "Modo claro" },
  "sidebar.darkMode": { en: "Dark mode", es: "Modo oscuro" },

  // ── Dashboard ───────────────────────────────────────────────────
  "dashboard.title": { en: "Study Overview", es: "Resumen de estudio" },
  "dashboard.subtitle": { en: "Track your USCPA exam preparation progress across all sections.", es: "Sigue el progreso de tu preparación para el examen USCPA en todas las secciones." },
  "dashboard.totalStudyHours": { en: "Total Study Hours", es: "Horas totales de estudio" },
  "dashboard.daysActive": { en: "days active", es: "días activos" },
  "dashboard.studyStreak": { en: "Study Streak", es: "Racha de estudio" },
  "dashboard.dayInARow": { en: "day in a row", es: "día consecutivo" },
  "dashboard.daysInARow": { en: "days in a row", es: "días consecutivos" },
  "dashboard.last14Days": { en: "Last 14 days", es: "Últimos 14 días" },
  "dashboard.weeklyStudyHours": { en: "Weekly Study Hours", es: "Horas de estudio semanal" },
  "dashboard.weeklySubtitle": { en: "Hours studied per day (last 7 days)", es: "Horas estudiadas por día (últimos 7 días)" },
  "dashboard.viewDetails": { en: "View Details", es: "Ver detalles" },
  "dashboard.studyHours": { en: "Study Hours", es: "Horas de estudio" },
  "dashboard.dAgo": { en: "d ago", es: "d atrás" },
  "dashboard.chaptersStudied": { en: "chapters studied", es: "capítulos estudiados" },
  "dashboard.recentStudySessions": { en: "Recent Study Sessions", es: "Sesiones de estudio recientes" },
  "dashboard.viewAllLogs": { en: "View all study logs", es: "Ver todos los registros" },
  "dashboard.recentInsights": { en: "Recent Insights", es: "Notas recientes" },
  "dashboard.noEssenceNotes": { en: "No essence notes yet for this section.", es: "Aún no hay notas para esta sección." },
  "dashboard.viewChapters": { en: "View chapters", es: "Ver capítulos" },
  "dashboard.today": { en: "Today", es: "Hoy" },
  "dashboard.yesterday": { en: "Yesterday", es: "Ayer" },

  // ── Chapters ────────────────────────────────────────────────────
  "chapters.title": { en: "Chapters", es: "Capítulos" },
  "chapters.subtitle": { en: "Track your study progress by chapter. Click a chapter to view details and record study sessions.", es: "Sigue tu progreso de estudio por capítulo. Haz clic en un capítulo para ver detalles y registrar sesiones." },
  "chapters.totalChapters": { en: "Total Chapters", es: "Total de capítulos" },
  "chapters.studied": { en: "Studied", es: "Estudiados" },
  "chapters.totalStudyTime": { en: "Total Study Time", es: "Tiempo total" },
  "chapters.overallAccuracy": { en: "Overall Accuracy", es: "Precisión general" },
  "chapters.allSections": { en: "All Sections", es: "Todas las secciones" },
  "chapters.completed": { en: "Completed", es: "Completado" },
  "chapters.chaptersCount": { en: "chapters", es: "capítulos" },
  "chapters.studiedSuffix": { en: "studied", es: "estudiados" },
  "chapters.accuracy": { en: "Accuracy", es: "Precisión" },
  "chapters.studyHoursSummary": { en: "Study Hours Summary by Chapter", es: "Resumen de horas de estudio por capítulo" },
  "chapters.grandTotal": { en: "Grand Total", es: "Total general" },

  // ── Chapter Detail ──────────────────────────────────────────────
  "chapterDetail.backToChapters": { en: "Back to Chapters", es: "Volver a capítulos" },
  "chapterDetail.chapter": { en: "Chapter", es: "Capítulo" },
  "chapterDetail.sessions": { en: "Sessions", es: "Sesiones" },
  "chapterDetail.studyTime": { en: "Study Time", es: "Tiempo de estudio" },
  "chapterDetail.questions": { en: "Questions", es: "Preguntas" },
  "chapterDetail.accuracy": { en: "Accuracy", es: "Precisión" },
  "chapterDetail.studyLog": { en: "Study Log", es: "Registro de estudio" },
  "chapterDetail.add": { en: "Add", es: "Añadir" },
  "chapterDetail.date": { en: "Date", es: "Fecha" },
  "chapterDetail.hours": { en: "Hours", es: "Horas" },
  "chapterDetail.hoursPlaceholder": { en: "e.g. 2.0", es: "ej. 2.0" },
  "chapterDetail.mc": { en: "MC (Multiple Choice)", es: "MC (Opción múltiple)" },
  "chapterDetail.tbs": { en: "TBS (Task-Based Simulations)", es: "TBS (Simulaciones)" },
  "chapterDetail.questionsLabel": { en: "Questions", es: "Preguntas" },
  "chapterDetail.correct": { en: "Correct", es: "Correctas" },
  "chapterDetail.total": { en: "Total", es: "Total" },
  "chapterDetail.memo": { en: "Memo", es: "Notas" },
  "chapterDetail.memoPlaceholder": { en: "What did you study today?", es: "¿Qué estudiaste hoy?" },
  "chapterDetail.recordSession": { en: "Record Session", es: "Registrar sesión" },
  "chapterDetail.cancel": { en: "Cancel", es: "Cancelar" },
  "chapterDetail.noSessions": { en: "No study sessions recorded yet.", es: "Aún no hay sesiones registradas." },
  "chapterDetail.addFirst": { en: "Click \"Add\" to record your first session.", es: "Haz clic en \"Añadir\" para registrar tu primera sesión." },

  // ── Study Log ───────────────────────────────────────────────────
  "studyLog.title": { en: "Study Log", es: "Registro de estudio" },
  "studyLog.subtitle": { en: "Record and track your daily study sessions by subject and chapter.", es: "Registra y sigue tus sesiones de estudio diarias por materia y capítulo." },
  "studyLog.totalSessions": { en: "Total Sessions", es: "Total sesiones" },
  "studyLog.studyDays": { en: "Study Days", es: "Días de estudio" },
  "studyLog.totalHours": { en: "Total Hours", es: "Horas totales" },
  "studyLog.newEntry": { en: "New Entry", es: "Nueva entrada" },
  "studyLog.newStudyEntry": { en: "New Study Entry", es: "Nueva entrada de estudio" },
  "studyLog.date": { en: "Date", es: "Fecha" },
  "studyLog.section": { en: "Section", es: "Sección" },
  "studyLog.chapter": { en: "Chapter", es: "Capítulo" },
  "studyLog.selectChapter": { en: "Select a chapter...", es: "Selecciona un capítulo..." },
  "studyLog.studyHours": { en: "Study Hours", es: "Horas de estudio" },
  "studyLog.hoursPlaceholder": { en: "e.g. 2.0", es: "ej. 2.0" },
  "studyLog.mc": { en: "MC (Multiple Choice)", es: "MC (Opción múltiple)" },
  "studyLog.tbs": { en: "TBS (Task-Based Simulations)", es: "TBS (Simulaciones)" },
  "studyLog.questions": { en: "Questions", es: "Preguntas" },
  "studyLog.correct": { en: "Correct", es: "Correctas" },
  "studyLog.memoNotes": { en: "Memo / Notes", es: "Notas / Memo" },
  "studyLog.memoPlaceholder": { en: "What did you study? What needs more review?", es: "¿Qué estudiaste? ¿Qué necesita más repaso?" },
  "studyLog.addEntry": { en: "Add Study Log Entry", es: "Agregar entrada" },
  "studyLog.allSections": { en: "All Sections", es: "Todas las secciones" },
  "studyLog.weeklySummary": { en: "Weekly Summary", es: "Resumen semanal" },
  "studyLog.hTotal": { en: "h total", es: "h total" },
  "studyLog.vsPrev": { en: "prev", es: "anterior" },
  "studyLog.noLogs": { en: "No study logs yet. Click \"New Entry\" to start recording.", es: "Aún no hay registros. Haz clic en \"Nueva entrada\" para comenzar." },
  "studyLog.session": { en: "session", es: "sesión" },
  "studyLog.sessions": { en: "sessions", es: "sesiones" },
  "studyLog.today": { en: "Today", es: "Hoy" },
  "studyLog.yesterday": { en: "Yesterday", es: "Ayer" },
  "studyLog.noStudySessions": { en: "No study sessions this week", es: "Sin sesiones de estudio esta semana" },
  "studyLog.weekComment.noSessions": { en: "No study sessions", es: "Sin sesiones de estudio" },
  "studyLog.weekComment.heavyMC": { en: "Heavy MC ({n}%)", es: "Mucho MC ({n}%)" },
  "studyLog.weekComment.heavyTBS": { en: "Heavy TBS ({n}%)", es: "Mucho TBS ({n}%)" },
  "studyLog.weekComment.goodBalance": { en: "Good MC/TBS balance", es: "Buen equilibrio MC/TBS" },
  "studyLog.weekComment.hoursDown": { en: "Hours down {n}% vs last week", es: "Horas bajaron {n}% vs semana pasada" },
  "studyLog.weekComment.hoursUp": { en: "Hours up {n}% vs last week", es: "Horas subieron {n}% vs semana pasada" },
  "chapterDetail.clickAdd": { en: "Click \"Add\" to record your first session.", es: "Haz clic en \"Añadir\" para registrar tu primera sesión." },
  "studyLog.total": { en: "Total", es: "Total" },
  "studyLog.questionsTotal": { en: "questions", es: "preguntas" },
  "studyLog.correctTotal": { en: "correct", es: "correctas" },
  "studyLog.accuracy": { en: "accuracy", es: "precisión" },
  "studyLog.heavyOnMC": { en: "Heavy on MC", es: "Mucho MC" },
  "studyLog.considerTBS": { en: "consider more TBS practice", es: "considera más práctica de TBS" },
  "studyLog.heavyOnTBS": { en: "Heavy on TBS", es: "Mucho TBS" },
  "studyLog.considerMC": { en: "consider more MC practice", es: "considera más práctica de MC" },
  "studyLog.goodBalance": { en: "Good balance across MC/TBS", es: "Buen equilibrio entre MC/TBS" },
  "studyLog.hoursDown": { en: "Total hours down", es: "Horas totales bajaron" },
  "studyLog.hoursUp": { en: "Total hours up", es: "Horas totales subieron" },
  "studyLog.vsLastWeek": { en: "vs last week", es: "vs semana pasada" },
  "studyLog.editEntry": { en: "Edit Entry", es: "Editar entrada" },
  "studyLog.editStudyEntry": { en: "Edit Study Entry", es: "Editar entrada de estudio" },
  "studyLog.updateEntry": { en: "Update Entry", es: "Actualizar entrada" },
  "studyLog.cancelEdit": { en: "Cancel", es: "Cancelar" },

  // ── Essence Notes ───────────────────────────────────────────────
  "essence.coreConcept": { en: "Core Concept", es: "Concepto clave" },
  "essence.framework": { en: "Framework", es: "Marco" },
  "essence.pitfall": { en: "Pitfall", es: "Trampa" },
  "essence.memoryRule": { en: "Memory Rule", es: "Regla mnemotécnica" },
  "essence.title": { en: "Essence Notes", es: "Notas esenciales" },
  "essence.screenshot": { en: "Screenshot", es: "Captura" },
  "essence.pasteText": { en: "Paste Text", es: "Pegar texto" },
  "essence.images": { en: "image", es: "imagen" },
  "essence.imagesPlural": { en: "images", es: "imágenes" },
  "essence.clear": { en: "Clear", es: "Limpiar" },
  "essence.uploadPrompt": { en: "Upload or paste screenshots (Cmd+V)", es: "Sube o pega capturas (Cmd+V)" },
  "essence.addImage": { en: "Add image", es: "Añadir imagen" },
  "essence.pasteMCQ": { en: "Paste MCQ or text content directly", es: "Pega contenido MCQ o texto directamente" },
  "essence.pastePlaceholder": { en: "Paste the question, options, and explanation as-is.\nExample:\nWhich of the following is correct regarding...\nA. ...\nB. ...\nC. ...\nD. ...\n\nExplanation: The correct answer is B because...", es: "Pega la pregunta, opciones y explicación tal cual.\nEjemplo:\n¿Cuál de las siguientes es correcta respecto a...?\nA. ...\nB. ...\nC. ...\nD. ...\n\nExplicación: La respuesta correcta es B porque..." },
  "essence.chars": { en: "chars", es: "caracteres" },
  "essence.analyzing": { en: "Analyzing...", es: "Analizando..." },
  "essence.extractInsights": { en: "Extract Insights with AI", es: "Extraer con IA" },
  "essence.imageTime": { en: "(1-2 min)", es: "(1-2 min)" },
  "essence.textTime": { en: "(30s-1 min)", es: "(30s-1 min)" },
  "essence.aiResults": { en: "AI Results", es: "Resultados de IA" },
  "essence.demo": { en: "DEMO", es: "DEMO" },
  "essence.saveAll": { en: "Save All", es: "Guardar todo" },
  "essence.save": { en: "Save", es: "Guardar" },
  "essence.all": { en: "All", es: "Todos" },
  "essence.noNotes": { en: "No notes yet", es: "Sin notas aún" },
  "essence.noNotesDesc": { en: "Upload screenshots to extract key insights with AI", es: "Sube capturas para extraer ideas clave con IA" },
  "essence.hide": { en: "Hide", es: "Ocultar" },
  "essence.source": { en: "Source", es: "Fuente" },
  "essence.textbook": { en: "Textbook", es: "Libro de texto" },
  "essence.mcq": { en: "MCQ", es: "MCQ" },
  "essence.tbsSim": { en: "TBS Simulation", es: "Simulación TBS" },
  "essence.other": { en: "Other", es: "Otro" },
  "essence.extractingText": { en: "Extracting text...", es: "Extrayendo texto..." },
  "essence.loadingImages": { en: "Loading images...", es: "Cargando imágenes..." },
  "essence.aiAnalyzing": { en: "AI analyzing content...", es: "IA analizando contenido..." },
  "essence.extractingInsights": { en: "Extracting key insights...", es: "Extrayendo ideas clave..." },
  "essence.structuringInsights": { en: "Structuring insights...", es: "Estructurando ideas..." },
  "essence.almostThere": { en: "Almost there...", es: "Casi listo..." },

  // ── Settings ────────────────────────────────────────────────────
  "settings.title": { en: "Settings", es: "Ajustes" },
  "settings.subtitle": { en: "Configure your study preferences and exam targets.", es: "Configura tus preferencias de estudio y metas de examen." },
  "settings.profile": { en: "Profile", es: "Perfil" },
  "settings.removePhoto": { en: "Remove photo", es: "Eliminar foto" },
  "settings.fullName": { en: "Full Name", es: "Nombre completo" },
  "settings.fullNamePlaceholder": { en: "Your full name", es: "Tu nombre completo" },
  "settings.email": { en: "Email Address", es: "Correo electrónico" },
  "settings.emailPlaceholder": { en: "your@email.com", es: "tu@correo.com" },
  "settings.appearance": { en: "Appearance", es: "Apariencia" },
  "settings.theme": { en: "Theme", es: "Tema" },
  "settings.light": { en: "Light", es: "Claro" },
  "settings.dark": { en: "Dark", es: "Oscuro" },
  "settings.system": { en: "System", es: "Sistema" },
  "settings.examTarget": { en: "Exam Target by Section", es: "Meta de examen por sección" },
  "settings.completed": { en: "Completed", es: "Completado" },
  "settings.markComplete": { en: "Mark Complete", es: "Marcar completo" },
  "settings.examDate": { en: "Exam Date", es: "Fecha de examen" },
  "settings.year": { en: "Year", es: "Año" },
  "settings.month": { en: "Mon", es: "Mes" },
  "settings.day": { en: "Day", es: "Día" },
  "settings.targetScore": { en: "Target Score", es: "Puntaje meta" },
  "settings.passing": { en: "Passing", es: "Aprobado" },
  "settings.studyPreferences": { en: "Study Preferences", es: "Preferencias de estudio" },
  "settings.dailyGoal": { en: "Daily Study Goal (hours)", es: "Meta diaria (horas)" },
  "settings.hour": { en: "hour", es: "hora" },
  "settings.hours": { en: "hours", es: "horas" },
  "settings.questionsPerSession": { en: "Questions per Session", es: "Preguntas por sesión" },
  "settings.questionsUnit": { en: "questions", es: "preguntas" },
  "settings.notifications": { en: "Notifications", es: "Notificaciones" },
  "settings.reviewAlerts": { en: "Review alerts", es: "Alertas de repaso" },
  "settings.weeklyReport": { en: "Weekly progress report", es: "Informe semanal de progreso" },
  "settings.streakNotifications": { en: "Streak notifications", es: "Notificaciones de racha" },
  "settings.milestoneNotifications": { en: "Milestone notifications", es: "Notificaciones de hitos" },
  "settings.notifBlocked": {
    en: "Notifications are blocked. Please enable them in your browser settings.",
    es: "Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.",
  },

  // Notification content
  "notif.review.title": { en: "Review Alert", es: "Alerta de repaso" },
  "notif.review.body": {
    en: "{count} chapters need review. Lowest: {chapter} at {retention}%",
    es: "{count} capítulos necesitan repaso. Más bajo: {chapter} al {retention}%",
  },
  "notif.streak.title": { en: "Streak at Risk!", es: "Racha en riesgo!" },
  "notif.streak.body": {
    en: "Your {streak}-day streak is at risk! Study today to keep it going.",
    es: "Tu racha de {streak} días está en riesgo! Estudia hoy para mantenerla.",
  },
  "notif.weekly.title": { en: "Weekly Summary", es: "Resumen semanal" },
  "notif.weekly.body": {
    en: "Last week: {hours}h, {sessions} sessions, {accuracy}% accuracy",
    es: "Semana pasada: {hours}h, {sessions} sesiones, {accuracy}% precisión",
  },
  "notif.milestone.streak": {
    en: "You've maintained a {n}-day streak!",
    es: "Has mantenido una racha de {n} días!",
  },
  "notif.milestone.hours": {
    en: "You've studied for {n} hours total!",
    es: "Has estudiado {n} horas en total!",
  },
  "notif.milestone.title": { en: "Milestone Reached!", es: "Hito alcanzado!" },
  "settings.saved": { en: "Saved!", es: "¡Guardado!" },
  "settings.saveChanges": { en: "Save Changes", es: "Guardar cambios" },
  "settings.changePassword": { en: "Change Password", es: "Cambiar contraseña" },
  "settings.currentPassword": { en: "Current Password", es: "Contraseña actual" },
  "settings.newPassword": { en: "New Password", es: "Nueva contraseña" },
  "settings.passwordMinLength": { en: "Password must be at least 8 characters", es: "La contraseña debe tener al menos 8 caracteres" },
  "settings.passwordMinLengthHint": { en: "Min. 8 characters", es: "Mín. 8 caracteres" },
  "settings.passwordChanged": { en: "Password updated successfully", es: "Contraseña actualizada" },
  "settings.passwordError": { en: "Failed to update password", es: "Error al actualizar contraseña" },
  "settings.updatePassword": { en: "Update Password", es: "Actualizar contraseña" },

  // ── Review (remaining) ──────────────────────────────────────────
  "review.title": { en: "Review Schedule", es: "Calendario de repaso" },
  "review.allSections": { en: "All Sections", es: "Todas las secciones" },
  "review.dAgo": { en: "d ago", es: "d atrás" },
  "review.next": { en: "Next", es: "Sig." },
  "review.reviews": { en: "reviews", es: "repasos" },
  "review.today": { en: "Today", es: "Hoy" },
  "review.tomorrow": { en: "Tomorrow", es: "Mañana" },

  // ── Mastery Levels (for components) ─────────────────────────────
  "mastery.new": { en: "New", es: "Nuevo" },
  "mastery.learning": { en: "Learning", es: "Aprendiendo" },
  "mastery.reviewing": { en: "Reviewing", es: "Repasando" },
  "mastery.mastered": { en: "Mastered", es: "Dominado" },

  // ── Common ──────────────────────────────────────────────────────
  "common.allSections": { en: "All Sections", es: "Todas las secciones" },
  "common.today": { en: "Today", es: "Hoy" },
  "common.yesterday": { en: "Yesterday", es: "Ayer" },

  // ── Analytics Engine (risk texts) ───────────────────────────────
  "risk.reviewDebt.critical.title": { en: "{n} chapters overdue", es: "{n} capítulos vencidos" },
  "risk.reviewDebt.critical.desc": { en: "{n} chapters have retention below 30%. Memory is fading rapidly.", es: "{n} capítulos tienen retención por debajo del 30%. La memoria se deteriora rápidamente." },
  "risk.reviewDebt.critical.rx": { en: "Prioritize reviewing overdue chapters before studying new material.", es: "Prioriza repasar los capítulos vencidos antes de estudiar material nuevo." },
  "risk.reviewDebt.warning.title": { en: "{n} chapters overdue", es: "{n} capítulos vencidos" },
  "risk.reviewDebt.warning.desc": { en: "{n} chapters need review soon to prevent forgetting.", es: "{n} capítulos necesitan repaso pronto para evitar el olvido." },
  "risk.reviewDebt.warning.rx": { en: "Schedule 30 minutes daily for overdue reviews.", es: "Programa 30 minutos diarios para repasos pendientes." },
  "risk.cramming.allNew.title": { en: "All new material, no reviews", es: "Solo material nuevo, sin repasos" },
  "risk.cramming.allNew.desc": { en: "In the last {d} days you studied {n} new chapters without reviewing any.", es: "En los últimos {d} días estudiaste {n} capítulos nuevos sin repasar ninguno." },
  "risk.cramming.allNew.rx": { en: "Use the 70/30 rule: 70% new material, 30% reviews.", es: "Usa la regla 70/30: 70% material nuevo, 30% repasos." },
  "risk.cramming.ratio.title": { en: "New:Review ratio too high", es: "Proporción nuevo:repaso demasiado alta" },
  "risk.cramming.ratio.desc": { en: "Ratio is {r}:1. You're learning too fast without reinforcing.", es: "La proporción es {r}:1. Estás aprendiendo demasiado rápido sin reforzar." },
  "risk.cramming.ratio.rx": { en: "Slow down on new chapters and catch up on reviews.", es: "Reduce capítulos nuevos y ponte al día con los repasos." },
  "risk.cramming.consider.title": { en: "Consider more reviews", es: "Considera más repasos" },
  "risk.cramming.consider.desc": { en: "New:Review ratio is {r}:1 (ideal < 2.5:1).", es: "Proporción nuevo:repaso es {r}:1 (ideal < 2.5:1)." },
  "risk.cramming.consider.rx": { en: "Add 1-2 review sessions per week to balance learning.", es: "Agrega 1-2 sesiones de repaso por semana para equilibrar." },
  "risk.stagnation.warning.title": { en: "{n} chapters not improving", es: "{n} capítulos sin mejorar" },
  "risk.stagnation.warning.desc": { en: "Multiple chapters show no accuracy improvement despite repeated reviews.", es: "Varios capítulos no muestran mejora en precisión a pesar de repasos repetidos." },
  "risk.stagnation.warning.rx": { en: "Try different study methods: watch videos, practice TBS, or teach the concept.", es: "Prueba diferentes métodos: videos, práctica TBS o enseña el concepto." },
  "risk.stagnation.info.title": { en: "{n} chapter(s) plateaued", es: "{n} capítulo(s) estancado(s)" },
  "risk.stagnation.info.desc": { en: "Some chapters aren't showing improvement with current study approach.", es: "Algunos capítulos no muestran mejora con el enfoque actual." },
  "risk.stagnation.info.rx": { en: "Consider changing study techniques for these chapters.", es: "Considera cambiar las técnicas de estudio para estos capítulos." },
  "risk.untouched.critical.title": { en: "{n}% chapters untouched", es: "{n}% de capítulos sin tocar" },
  "risk.untouched.critical.desc": { en: "{a} of {b} chapters haven't been studied yet, with an exam within 30 days.", es: "{a} de {b} capítulos no se han estudiado aún, con un examen en menos de 30 días." },
  "risk.untouched.critical.rx": { en: "Focus on high-yield chapters and create a rapid coverage plan.", es: "Enfócate en capítulos de alto rendimiento y crea un plan de cobertura rápida." },
  "risk.untouched.warning.title": { en: "{n}% chapters untouched", es: "{n}% de capítulos sin tocar" },
  "risk.untouched.warning.desc": { en: "{n} chapters haven't been studied yet.", es: "{n} capítulos no se han estudiado aún." },
  "risk.untouched.warning.rx": { en: "Increase daily study time or prioritize key chapters.", es: "Aumenta el tiempo de estudio diario o prioriza capítulos clave." },
  "risk.variance.critical.title": { en: "Highly inconsistent study schedule", es: "Horario de estudio muy inconsistente" },
  "risk.variance.critical.desc": { en: "Weekly hours vary greatly (CV={n}%). Consistency beats intensity.", es: "Las horas semanales varían mucho (CV={n}%). La constancia supera la intensidad." },
  "risk.variance.critical.rx": { en: "Set a fixed daily study time and stick to it, even if shorter.", es: "Establece un horario fijo de estudio diario y cúmplelo, aunque sea más corto." },
  "risk.variance.warning.title": { en: "Inconsistent study pattern", es: "Patrón de estudio inconsistente" },
  "risk.variance.warning.desc": { en: "Study hours fluctuate week to week (CV={n}%).", es: "Las horas de estudio fluctúan semana a semana (CV={n}%)." },
  "risk.variance.warning.rx": { en: "Try to maintain a more consistent daily routine.", es: "Intenta mantener una rutina diaria más consistente." },
  "risk.allocation.paceGood": { en: "Current pace looks good.", es: "El ritmo actual se ve bien." },
  "risk.allocation.behind": { en: "Behind by {n} days. Increase pace to catch up.", es: "Atrasado por {n} días. Aumenta el ritmo para ponerte al día." },
  "risk.allocation.ahead": { en: "Ahead of schedule. Redistribute time to weaker sections.", es: "Adelantado. Redistribuye tiempo a secciones más débiles." },
  "risk.allocation.overdueReview": { en: "{n} overdue chapters need urgent review.", es: "{n} capítulos vencidos necesitan repaso urgente." },

  // ── Analytics Drill-Down ────────────────────────────────────────
  "analytics.drilldown.session": { en: "Session", es: "Sesión" },
  "analytics.drilldown.accuracy": { en: "Accuracy", es: "Precisión" },
  "analytics.drilldown.selectChapter": { en: "Select a chapter to view accuracy trend", es: "Selecciona un capítulo para ver la tendencia de precisión" },
  "analytics.retention.chapter": { en: "Chapter", es: "Capítulo" },

  // ── Week days ───────────────────────────────────────────────────
  "day.sun": { en: "Sun", es: "Dom" },
  "day.mon": { en: "Mon", es: "Lun" },
  "day.tue": { en: "Tue", es: "Mar" },
  "day.wed": { en: "Wed", es: "Mié" },
  "day.thu": { en: "Thu", es: "Jue" },
  "day.fri": { en: "Fri", es: "Vie" },
  "day.sat": { en: "Sat", es: "Sáb" },

  // ── Onboarding Tour ──────────────────────────────────────────
  "tour.step1.title": { en: "Welcome to CPA Mastery!", es: "¡Bienvenido a CPA Mastery!" },
  "tour.step1.desc": { en: "This is your Dashboard — your central hub. Here you can see study hours, streak, exam section progress, and review queue at a glance. Let's walk through each page.", es: "Este es tu Panel — tu centro de control. Aquí puedes ver horas de estudio, racha, progreso por sección y cola de repaso de un vistazo. Veamos cada página." },
  "tour.step2.title": { en: "Track Your Progress", es: "Sigue tu progreso" },
  "tour.step2.desc": { en: "These cards show your total study hours across all sections and your daily streak. Study consistently every day to build your streak — even 30 minutes counts!", es: "Estas tarjetas muestran tus horas totales y tu racha diaria. Estudia cada día para mantener tu racha — ¡incluso 30 minutos cuenta!" },
  "tour.step3.title": { en: "Chapters — Your Study Hub", es: "Capítulos — Tu centro de estudio" },
  "tour.step3.desc": { en: "All chapters organized by exam section (FAR, AUD, REG, etc.). Tap any chapter to open its detail page where you can:\n• Record study sessions (hours, MC/TBS questions)\n• Save key insights with AI-powered Essence Notes\n• Track accuracy and study time per chapter", es: "Todos los capítulos organizados por sección (FAR, AUD, REG, etc.). Toca cualquier capítulo para:\n• Registrar sesiones de estudio (horas, preguntas MC/TBS)\n• Guardar ideas clave con Notas Esenciales con IA\n• Rastrear precisión y tiempo por capítulo" },
  "tour.step4.title": { en: "Study Log — Record Every Session", es: "Registro — Registra cada sesión" },
  "tour.step4.desc": { en: "Your complete study history. Each entry tracks date, hours, MC/TBS questions, and accuracy.\n• Click \"New Entry\" to add a session\n• Weekly Summary shows study patterns and trends\n• Charts visualize your study hours by section", es: "Tu historial completo de estudio. Cada entrada registra fecha, horas, preguntas MC/TBS y precisión.\n• Haz clic en \"Nueva entrada\" para agregar una sesión\n• El Resumen Semanal muestra patrones y tendencias\n• Los gráficos visualizan tus horas por sección" },
  "tour.step5.title": { en: "Practice Exam — Simulate Test Day", es: "Examen de práctica — Simula el día del examen" },
  "tour.step5.desc": { en: "Log your mock exam scores by section, tracking MC and TBS results separately.\n• Click \"Add Result\" to record a practice exam\n• Score trend chart shows improvement over time\n• Aim for 75+ on practice exams to be exam-ready!", es: "Registra tus puntuaciones por sección, con resultados MC y TBS separados.\n• Haz clic en \"Agregar resultado\" para registrar un examen\n• El gráfico de tendencia muestra tu mejora\n• ¡Apunta a 75+ en exámenes de práctica!" },
  "tour.step6.title": { en: "Review — Beat the Forgetting Curve", es: "Repaso — Vence la curva del olvido" },
  "tour.step6.desc": { en: "Powered by spaced repetition (Ebbinghaus forgetting curve). Chapters are ranked by memory retention.\n• Red = Overdue — review immediately!\n• Yellow = Due Today — scheduled review time\n• Green = Well Retained — no rush\nTap any chapter to see its forgetting curve and rate your recall.", es: "Basado en la repetición espaciada (curva de Ebbinghaus). Los capítulos se ordenan por retención.\n• Rojo = Vencido — ¡repasa ahora!\n• Amarillo = Para hoy — momento de repaso\n• Verde = Bien retenido — sin prisa\nToca cualquier capítulo para ver su curva y calificar tu recuerdo." },
  "tour.step7.title": { en: "Analytics — Strategic Insights", es: "Analíticas — Información estratégica" },
  "tour.step7.desc": { en: "Data-driven guidance for smarter studying:\n• Goal Pace — Are you on track for your exam date?\n• Risk Radar — Detects cramming, review debt, stagnation\n• Retention Calibration — Predicted vs actual recall\n• Coverage Gaps — Untouched or fragile chapters\nSet exam dates in Settings to unlock full analysis.", es: "Orientación basada en datos:\n• Ritmo del objetivo — ¿Estás al día para tu examen?\n• Radar de riesgos — Detecta atracón, deuda de repaso\n• Calibración — Recuerdo predicho vs real\n• Brechas — Capítulos sin tocar o frágiles\nEstablece fechas de examen en Ajustes." },
  "tour.step8.title": { en: "Settings — Set Your Goals", es: "Ajustes — Configura tus metas" },
  "tour.step8.desc": { en: "Configure your study experience:\n• Set exam dates and target scores per section\n• Adjust daily study goals\n• Manage notification preferences (review alerts, streak protection)\n• Your exam dates power the Goal Pace analysis in Analytics", es: "Configura tu experiencia de estudio:\n• Establece fechas de examen y metas por sección\n• Ajusta metas diarias de estudio\n• Gestiona notificaciones (alertas de repaso, racha)\n• Tus fechas de examen alimentan el análisis de ritmo" },
  "tour.step9.title": { en: "You're All Set!", es: "¡Todo listo!" },
  "tour.step9.desc": { en: "Start by heading to Chapters and recording your first study session. As you add data, your dashboard, review schedule, and analytics will come alive. You can restart this tour anytime from the \"How to use\" guide on the Dashboard. Good luck!", es: "Comienza yendo a Capítulos y registrando tu primera sesión. A medida que agregues datos, tu panel, repaso y analíticas cobrarán vida. Puedes reiniciar este recorrido desde la guía \"Cómo usar\" en el Panel. ¡Buena suerte!" },
  "tour.next": { en: "Next", es: "Siguiente" },
  "tour.skip": { en: "Skip", es: "Omitir" },
  "tour.finish": { en: "Got it!", es: "¡Entendido!" },
  "tour.stepOf": { en: "of", es: "de" },
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
