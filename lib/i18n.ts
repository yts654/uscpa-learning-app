"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import React from "react"

export type Locale = "en" | "es" | "ja"

const translations = {
  // Nav descriptions
  "nav.dashboard.desc": {
    en: "Overview of your study progress",
    es: "Resumen de tu progreso de estudio",
    ja: "学習の進捗状況の概要",
  },
  "nav.chapters.desc": {
    en: "Select a chapter to start studying",
    es: "Selecciona un capítulo para empezar a estudiar",
    ja: "チャプターを選んで学習を始める",
  },
  "nav.studyLog.desc": {
    en: "View and add study records",
    es: "Ver y agregar registros de estudio",
    ja: "学習記録の閲覧・追加",
  },
  "nav.review.desc": {
    en: "Spaced repetition review schedule",
    es: "Calendario de repaso con repetición espaciada",
    ja: "間隔反復の復習スケジュール",
  },
  "nav.analytics.desc": {
    en: "Performance analysis and trends",
    es: "Análisis de rendimiento y tendencias",
    ja: "学習成績の分析と傾向",
  },
  "nav.settings.desc": {
    en: "Profile and configuration",
    es: "Perfil y configuración",
    ja: "プロフィールと設定",
  },

  // Dashboard guide
  "guide.title": { en: "How to use", es: "Cómo usar", ja: "使い方" },
  "guide.step1.title": { en: "Select a chapter in Chapters", es: "Selecciona un capítulo en Chapters", ja: "学習するチャプターを選択" },
  "guide.step1.desc": { en: "Choose a chapter to study", es: "Elige un capítulo para estudiar", ja: "学習するチャプターを選ぶ" },
  "guide.step2.title": { en: "Record your Study Log", es: "Registra tu Study Log", ja: "学習記録を登録" },
  "guide.step2.desc": { en: "Add study records from the chapter detail page", es: "Agrega registros de estudio desde la página de detalle del capítulo", ja: "チャプター詳細ページから学習記録を追加" },
  "guide.step3.title": { en: "Check your Review schedule", es: "Consulta tu calendario de Review", ja: "復習スケジュールを確認" },
  "guide.step3.desc": { en: "Optimal review timing based on the forgetting curve", es: "Momento óptimo de repaso basado en la curva del olvido", ja: "忘却曲線に基づく最適な復習タイミング" },
  "guide.openChapters": { en: "Open Chapters", es: "Abrir Chapters", ja: "チャプターを開く" },
  "guide.startTour": { en: "Take the Tour", es: "Iniciar el recorrido", ja: "ツアーを開始" },

  // Dashboard empty state
  "dashboard.empty.noSessions": { en: "No study sessions recorded yet.", es: "Aún no hay sesiones de estudio registradas.", ja: "学習セッションはまだ記録されていません。" },
  "dashboard.empty.startStudying": { en: "Select a chapter from Chapters to start your first study session.", es: "Selecciona un capítulo en Chapters para comenzar tu primera sesión de estudio.", ja: "チャプターを選んで最初の学習を始めましょう。" },
  "dashboard.empty.openChapters": { en: "Open Chapters", es: "Abrir Chapters", ja: "チャプターを開く" },
  "dashboard.section.noSessions": { en: "No study sessions yet for this section.", es: "Aún no hay sesiones de estudio para esta sección.", ja: "このセクションの学習セッションはまだありません。" },
  "dashboard.section.startStudying": { en: "Open a chapter in this section to start studying.", es: "Abre un capítulo en esta sección para empezar a estudiar.", ja: "このセクションのチャプターを開いて学習を始めましょう。" },
  "dashboard.section.openChapters": { en: "Open chapters", es: "Abrir capítulos", ja: "チャプターを開く" },

  // Review criteria panel
  "review.criteria.title": { en: "Review Schedule Criteria", es: "Criterios del calendario de repaso", ja: "復習スケジュールの基準" },
  "review.criteria.intervals.title": { en: "Review Intervals", es: "Intervalos de repaso", ja: "復習間隔" },
  "review.criteria.intervals.desc": { en: "The interval until the next review increases with each review", es: "El intervalo hasta el próximo repaso aumenta con cada repaso", ja: "復習ごとに次の復習までの間隔が長くなります" },
  "review.criteria.intervals.1st": { en: "1st", es: "1.°", ja: "1回目" },
  "review.criteria.intervals.2nd": { en: "2nd", es: "2.°", ja: "2回目" },
  "review.criteria.intervals.3rd": { en: "3rd", es: "3.°", ja: "3回目" },
  "review.criteria.intervals.4th": { en: "4th", es: "4.°", ja: "4回目" },
  "review.criteria.intervals.5th": { en: "5th+", es: "5.°+", ja: "5回目以降" },
  "review.criteria.intervals.1d": { en: "after 1 day", es: "después de 1 día", ja: "1日後" },
  "review.criteria.intervals.3d": { en: "after 3 days", es: "después de 3 días", ja: "3日後" },
  "review.criteria.intervals.7d": { en: "after 7 days", es: "después de 7 días", ja: "7日後" },
  "review.criteria.intervals.14d": { en: "after 14 days", es: "después de 14 días", ja: "14日後" },
  "review.criteria.intervals.30d": { en: "after 30 days+", es: "después de 30 días+", ja: "30日後以上" },

  // Alert criteria
  "review.criteria.alerts.title": { en: "Alert Criteria", es: "Criterios de alerta", ja: "アラート基準" },
  "review.criteria.alerts.desc": { en: "Retention is calculated automatically from review count and elapsed days", es: "La retención se calcula automáticamente a partir del número de repasos y los días transcurridos", ja: "定着率は復習回数と経過日数から自動計算されます" },
  "review.criteria.alerts.overdue.label": { en: "Overdue — Retention below 30%", es: "Vencido — Retención por debajo del 30%", ja: "期限超過 — 定着率30%未満" },
  "review.criteria.alerts.overdue.desc": { en: "Memory has significantly faded. Review immediately.", es: "La memoria se ha debilitado significativamente. Repasa de inmediato.", ja: "記憶が大幅に薄れています。すぐに復習してください。" },
  "review.criteria.alerts.dueToday.label": { en: "Due Today — Next review date is today or earlier", es: "Para hoy — La próxima fecha de repaso es hoy o anterior", ja: "本日期限 — 次の復習日が今日以前" },
  "review.criteria.alerts.dueToday.desc": { en: "Scheduled review timing has arrived.", es: "Ha llegado el momento programado de repaso.", ja: "予定された復習のタイミングです。" },
  "review.criteria.alerts.comingUp.label": { en: "Coming Up — Review due within 7 days", es: "Próximamente — Repaso dentro de 7 días", ja: "まもなく — 7日以内に復習予定" },
  "review.criteria.alerts.comingUp.desc": { en: "Review timing is approaching soon.", es: "El momento de repaso se acerca pronto.", ja: "復習のタイミングが近づいています。" },

  // Mastery levels
  "review.criteria.mastery.title": { en: "Mastery Levels", es: "Niveles de dominio", ja: "習熟レベル" },
  "review.criteria.mastery.new": { en: "Not studied", es: "No estudiado", ja: "未学習" },
  "review.criteria.mastery.learning": { en: "1-2 reviews", es: "1-2 repasos", ja: "1〜2回復習" },
  "review.criteria.mastery.reviewing": { en: "3-4 reviews or 5+ with retention ≤50%", es: "3-4 repasos o 5+ con retención ≤50%", ja: "3〜4回復習、または5回以上で定着率50%以下" },
  "review.criteria.mastery.mastered": { en: "5+ reviews and retention >50%", es: "5+ repasos y retención >50%", ja: "5回以上復習かつ定着率50%超" },

  // Retention colors
  "review.criteria.retention.title": { en: "Retention Color Scale", es: "Escala de colores de retención", ja: "定着率の色分け" },
  "review.criteria.retention.stable": { en: "Stable", es: "Estable", ja: "安定" },
  "review.criteria.retention.good": { en: "Good", es: "Bueno", ja: "良好" },
  "review.criteria.retention.caution": { en: "Caution", es: "Precaución", ja: "注意" },
  "review.criteria.retention.needsReview": { en: "Needs review", es: "Necesita repaso", ja: "要復習" },

  // Review alerts
  "review.alert.title": { en: "Review Alert", es: "Alerta de repaso", ja: "復習アラート" },
  "review.alert.retention": { en: "Retention", es: "Retención", ja: "定着率" },
  "review.alert.daysAgo": { en: "days ago", es: "días atrás", ja: "日前" },
  "review.alert.overdue": { en: "Needs review", es: "Necesita repaso", ja: "要復習" },
  "review.alert.dueToday": { en: "Review today", es: "Repasar hoy", ja: "今日復習" },

  // Review chart
  "review.chart.title": { en: "Forgetting Curve — Per Chapter", es: "Curva del olvido — Por capítulo", ja: "忘却曲線 — チャプター別" },
  "review.chart.selectedDesc": { en: "'s forgetting curve", es: " — curva del olvido", ja: "の忘却曲線" },
  "review.chart.defaultDesc": { en: "Select a chapter to view its individual curve", es: "Selecciona un capítulo para ver su curva individual", ja: "チャプターを選択して個別の曲線を表示" },
  "review.chart.xLabel": { en: "Days elapsed", es: "Días transcurridos", ja: "経過日数" },
  "review.chart.currentCurve": { en: "Current curve", es: "Curva actual", ja: "現在の曲線" },
  "review.chart.nextCurve": { en: "Predicted after next review", es: "Predicción después del próximo repaso", ja: "次回復習後の予測" },
  "review.chart.daysSuffix": { en: " days elapsed", es: " días transcurridos", ja: "日経過" },
  "review.chart.currentPosition": { en: "Current position", es: "Posición actual", ja: "現在位置" },

  // Forgetting Curve help
  "review.curveHelp.whatTitle": { en: "What is this chart?", es: "¿Qué es este gráfico?", ja: "このグラフについて" },
  "review.curveHelp.whatDesc": { en: "This shows how your memory of each chapter fades over time (the \"forgetting curve\"). The Y-axis is retention %, and the X-axis is days since your last study session. Each line represents one chapter.", es: "Muestra cómo tu memoria de cada capítulo se desvanece con el tiempo (la \"curva del olvido\"). El eje Y es el % de retención y el eje X son los días desde tu última sesión de estudio. Cada línea representa un capítulo.", ja: "各チャプターの記憶が時間とともにどのように薄れていくか（「忘却曲線」）を示しています。Y軸は定着率（%）、X軸は最後の学習からの経過日数です。各線が1つのチャプターを表します。" },
  "review.curveHelp.howTitle": { en: "How to read it", es: "Cómo interpretarlo", ja: "読み方" },
  "review.curveHelp.how1": { en: "• Click a chapter chip below to see its individual curve. The solid line shows your current decay rate; the dashed line shows how it would improve after one more review.", es: "• Haz clic en un chip de capítulo para ver su curva individual. La línea sólida muestra tu tasa de decaimiento actual; la línea punteada muestra cómo mejoraría después de un repaso más.", ja: "• 下のチャプター名をクリックすると個別の曲線が表示されます。実線は現在の減衰率、破線は次の復習後の改善予測です。" },
  "review.curveHelp.how2": { en: "• The colored dot marks where you are today — your current retention level and how many days have passed since you last studied that chapter.", es: "• El punto de color marca dónde estás hoy: tu nivel de retención actual y cuántos días han pasado desde que estudiaste ese capítulo.", ja: "• 色付きのドットは現在の位置を示します — 現在の定着率と最後にそのチャプターを学習してからの経過日数です。" },
  "review.curveHelp.how3": { en: "• Chapters with more reviews have flatter curves (slower forgetting). Each review strengthens memory and extends the time before the next review is needed.", es: "• Los capítulos con más repasos tienen curvas más planas (olvido más lento). Cada repaso fortalece la memoria y extiende el tiempo antes de que se necesite el siguiente repaso.", ja: "• 復習回数が多いチャプターほど曲線が緩やかになります（忘却が遅い）。復習するたびに記憶が強化され、次の復習までの時間が延びます。" },
  "review.curveHelp.actionTitle": { en: "What should I do?", es: "¿Qué debo hacer?", ja: "何をすべき？" },
  "review.curveHelp.actionDesc": { en: "Review chapters before they drop below 30% retention (the danger zone). Chapters marked with a warning icon are overdue or due today — prioritize those first. Use the Recall Rating buttons to log how well you remember each chapter.", es: "Repasa los capítulos antes de que caigan por debajo del 30% de retención (zona de peligro). Los capítulos marcados con icono de advertencia están vencidos o vencen hoy — prioriza esos primero. Usa los botones de Recall Rating para registrar qué tan bien recuerdas cada capítulo.", ja: "定着率が30%を下回る前にチャプターを復習しましょう。警告アイコン付きのチャプターは期限超過または本日期限です — それらを優先してください。記憶度の評価ボタンで各チャプターの覚え具合を記録できます。" },

  // Review detail labels
  "review.detail.retention": { en: "Retention", es: "Retención", ja: "定着率" },
  "review.detail.reviewCount": { en: "Review Count", es: "Número de repasos", ja: "復習回数" },
  "review.detail.reviewCountUnit": { en: "times", es: "veces", ja: "回" },
  "review.detail.lastStudied": { en: "Last Studied", es: "Último estudio", ja: "最終学習" },
  "review.detail.daysAgoUnit": { en: " days ago", es: " días atrás", ja: "日前" },
  "review.detail.nextReview": { en: "Next Review", es: "Próximo repaso", ja: "次の復習" },
  "review.detail.reviewsSuffix": { en: " reviews", es: " repasos", ja: "回復習" },

  // Review header
  "review.header.desc": { en: "Based on the Ebbinghaus forgetting curve. Chapters are ranked by memory retention — review overdue items first to maximize long-term recall.", es: "Basado en la curva del olvido de Ebbinghaus. Los capítulos se ordenan por retención de memoria — repasa primero los vencidos para maximizar la retención a largo plazo.", ja: "エビングハウスの忘却曲線に基づいています。チャプターは記憶定着率順に並んでいます — 長期記憶を最大化するため、期限超過のものから優先的に復習しましょう。" },

  // Review urgency groups
  "review.group.overdue.desc": { en: "Retention below 30% — review immediately", es: "Retención por debajo del 30% — repasa de inmediato", ja: "定着率30%未満 — すぐに復習" },
  "review.group.dueToday.desc": { en: "Scheduled for review today", es: "Programado para repasar hoy", ja: "本日復習予定" },
  "review.group.comingUp.desc": { en: "Due within the next 7 days", es: "Pendiente en los próximos 7 días", ja: "7日以内に復習予定" },
  "review.group.wellRetained.desc": { en: "Retention above 70% — no rush", es: "Retención por encima del 70% — sin prisa", ja: "定着率70%以上 — 急ぎません" },
  "review.group.notStudied.desc": { en: "Start studying to begin tracking retention", es: "Comienza a estudiar para empezar a rastrear la retención", ja: "学習を始めると定着度の確認ができます" },

  // Mock Exams — nav
  "nav.mockExams.desc": { en: "Track practice exam scores by section", es: "Registra las puntuaciones de exámenes de práctica por sección", ja: "セクション別の模擬試験スコアを記録" },

  // Mock Exams — header
  "mockExams.title": { en: "Practice Exam", es: "Examen de práctica", ja: "模擬試験" },
  "mockExams.subtitle": { en: "Track your practice exam results across all sections", es: "Registra los resultados de tus exámenes de práctica en todas las secciones", ja: "全セクションの模擬試験結果を記録" },

  // Mock Exams — form
  "mockExams.form.addResult": { en: "Add Result", es: "Agregar resultado", ja: "結果を追加" },
  "mockExams.form.date": { en: "Date", es: "Fecha", ja: "日付" },
  "mockExams.form.section": { en: "Section", es: "Sección", ja: "セクション" },
  "mockExams.form.source": { en: "Source", es: "Fuente", ja: "教材" },
  "mockExams.form.sourcePlaceholder": { en: "e.g. Becker, Wiley, Roger CPA...", es: "ej. Becker, Wiley, Roger CPA...", ja: "例: Becker, Wiley, Roger CPA..." },
  "mockExams.form.selectSource": { en: "Select provider...", es: "Seleccionar proveedor...", ja: "教材を選択..." },
  "mockExams.form.mcQuestions": { en: "MC Questions", es: "Preguntas MC", ja: "MC問題数" },
  "mockExams.form.mcCorrect": { en: "MC Correct", es: "MC correctas", ja: "MC正解数" },
  "mockExams.form.tbsQuestions": { en: "TBS Questions", es: "Preguntas TBS", ja: "TBS問題数" },
  "mockExams.form.tbsCorrect": { en: "TBS Correct", es: "TBS correctas", ja: "TBS正解数" },
  "mockExams.form.total": { en: "Total", es: "Total", ja: "合計" },
  "mockExams.form.accuracy": { en: "Accuracy", es: "Precisión", ja: "正答率" },
  "mockExams.form.memo": { en: "Memo", es: "Notas", ja: "メモ" },
  "mockExams.form.memoPlaceholder": { en: "Notes about this exam...", es: "Notas sobre este examen...", ja: "この試験に関するメモ..." },
  "mockExams.form.submit": { en: "Save Result", es: "Guardar resultado", ja: "結果を保存" },
  "mockExams.form.cancel": { en: "Cancel", es: "Cancelar", ja: "キャンセル" },
  "mockExams.form.validationError": { en: "Correct answers cannot exceed total questions", es: "Las respuestas correctas no pueden superar el total de preguntas", ja: "正解数は問題数を超えることはできません" },

  // Mock Exams — summary cards
  "mockExams.summary.bestScore": { en: "Best Score", es: "Mejor puntuación", ja: "最高スコア" },
  "mockExams.summary.latestScore": { en: "Latest Score", es: "Última puntuación", ja: "最新スコア" },
  "mockExams.summary.attempts": { en: "Attempts", es: "Intentos", ja: "受験回数" },
  "mockExams.summary.noData": { en: "No data", es: "Sin datos", ja: "データなし" },

  // Mock Exams — chart
  "mockExams.chart.title": { en: "Score Trend", es: "Tendencia de puntuación", ja: "スコア推移" },
  "mockExams.chart.accuracy": { en: "Accuracy (%)", es: "Precisión (%)", ja: "正答率（%）" },
  "mockExams.chart.noData": { en: "No chart data yet. Add practice exam results to see trends.", es: "Aún no hay datos del gráfico. Agrega resultados de exámenes de práctica para ver tendencias.", ja: "グラフデータがまだありません。模擬試験の結果を追加するとトレンドが表示されます。" },

  // Mock Exams — results
  "mockExams.results.title": { en: "Results", es: "Resultados", ja: "結果一覧" },
  "mockExams.results.empty": { en: "No practice exam results yet. Click \"Add Result\" to record your first exam.", es: "Aún no hay resultados de exámenes de práctica. Haz clic en \"Agregar resultado\" para registrar tu primer examen.", ja: "模擬試験の結果がまだありません。「結果を追加」をクリックして最初の試験を記録しましょう。" },
  "mockExams.results.delete": { en: "Delete", es: "Eliminar", ja: "削除" },
  "mockExams.results.mc": { en: "MC", es: "MC", ja: "MC" },
  "mockExams.results.tbs": { en: "TBS", es: "TBS", ja: "TBS" },

  // Mock Exams — filter
  "mockExams.filter.all": { en: "All", es: "Todos", ja: "すべて" },

  // Review — summary strip labels
  "review.summary.studied": { en: "Studied", es: "Estudiado", ja: "学習済み" },
  "review.summary.overdue": { en: "Overdue", es: "Vencido", ja: "期限超過" },
  "review.summary.avgRetention": { en: "Avg Retention", es: "Retención prom.", ja: "平均定着率" },
  "review.summary.mastered": { en: "Mastered", es: "Dominado", ja: "習得済み" },

  // Review — urgency group labels
  "review.group.overdue.label": { en: "Overdue", es: "Vencido", ja: "期限超過" },
  "review.group.dueToday.label": { en: "Due Today", es: "Para hoy", ja: "本日期限" },
  "review.group.comingUp.label": { en: "Coming Up", es: "Próximamente", ja: "まもなく" },
  "review.group.wellRetained.label": { en: "Well Retained", es: "Bien retenido", ja: "定着良好" },
  "review.group.notStudied.label": { en: "Not Yet Studied", es: "Aún no estudiado", ja: "未学習" },

  // Review — alert section
  "review.alert.needsReview": { en: "Needs review", es: "Necesita repaso", ja: "要復習" },
  "review.alert.reviewToday": { en: "Review today", es: "Repasar hoy", ja: "今日復習" },

  // Dashboard — review queue
  "dashboard.reviewQueue.title": { en: "Review Queue", es: "Cola de repaso", ja: "要復習リスト" },
  "dashboard.reviewQueue.desc": { en: "Chapters needing review based on forgetting curve", es: "Capítulos que necesitan repaso según la curva del olvido", ja: "忘却曲線に基づき復習が必要なチャプター" },
  "dashboard.reviewQueue.viewSchedule": { en: "View Schedule", es: "Ver calendario", ja: "スケジュールを見る" },

  // Dashboard — sections
  "dashboard.sections.title": { en: "Exam Sections", es: "Secciones del examen", ja: "試験セクション" },
  "dashboard.sections.viewAll": { en: "View All Chapters", es: "Ver todos los capítulos", ja: "全チャプターを見る" },
  "dashboard.recentActivity.title": { en: "Recent Activity", es: "Actividad reciente", ja: "最近のアクティビティ" },
  "dashboard.recentActivity.viewLog": { en: "View Study Log", es: "Ver registro de estudio", ja: "学習記録を見る" },

  // Settings language
  "settings.language": { en: "Language", es: "Idioma", ja: "言語" },

  // ── Analytics ─────────────────────────────────────────────────
  "analytics.title": { en: "Analytics", es: "Analíticas", ja: "分析" },
  "analytics.subtitle": { en: "Strategic insights to guide your study decisions.", es: "Información estratégica para guiar tus decisiones de estudio.", ja: "学習方針に役立つ分析データ。" },

  // Pace Engine
  "analytics.pace.title": { en: "Goal Pace", es: "Ritmo del objetivo", ja: "目標ペース" },
  "analytics.pace.subtitle": { en: "Required vs actual weekly pace toward your exam date", es: "Ritmo semanal requerido vs real hacia tu fecha de examen", ja: "試験日までに必要な学習量と実績の比較" },
  "analytics.pace.remaining": { en: "Remaining", es: "Restante", ja: "残り" },
  "analytics.pace.chapters": { en: "chapters", es: "capítulos", ja: "チャプター" },
  "analytics.pace.estimatedHours": { en: "Est. hours left", es: "Horas est. restantes", ja: "推定残り時間" },
  "analytics.pace.weeklyRequired": { en: "Weekly required", es: "Requerido semanal", ja: "週間必要量" },
  "analytics.pace.weeklyActual": { en: "Weekly actual", es: "Real semanal", ja: "週間実績" },
  "analytics.pace.eta": { en: "ETA", es: "Fecha est.", ja: "完了予定" },
  "analytics.pace.delay": { en: "Delay", es: "Retraso", ja: "遅延" },
  "analytics.pace.onTrack": { en: "On track", es: "En camino", ja: "順調" },
  "analytics.pace.ahead": { en: "Ahead of schedule", es: "Adelantado", ja: "前倒し" },
  "analytics.pace.behind": { en: "Behind schedule", es: "Atrasado", ja: "遅延中" },
  "analytics.pace.noGoal": { en: "Set an exam date in Settings to see pace analysis.", es: "Establece una fecha de examen en Settings para ver el análisis de ritmo.", ja: "設定で試験日を登録するとペース分析が利用できます。" },
  "analytics.pace.hPerWeek": { en: "h/week", es: "h/semana", ja: "時間/週" },
  "analytics.pace.days": { en: "days", es: "días", ja: "日" },
  "analytics.pace.weeksLeft": { en: "weeks left", es: "semanas restantes", ja: "週間残り" },

  // Risk Radar
  "analytics.risk.title": { en: "Risk Radar", es: "Radar de riesgos", ja: "リスク分析" },
  "analytics.risk.subtitle": { en: "Potential issues that may affect your progress", es: "Problemas potenciales que pueden afectar tu progreso", ja: "学習の進捗に影響しうる問題点" },
  "analytics.risk.noRisks": { en: "No risks detected. Keep up the good work!", es: "No se detectaron riesgos. ¡Sigue así!", ja: "リスクは検出されませんでした。この調子で頑張りましょう！" },
  "analytics.risk.critical": { en: "Critical", es: "Crítico", ja: "重大" },
  "analytics.risk.warning": { en: "Warning", es: "Advertencia", ja: "警告" },
  "analytics.risk.info": { en: "Info", es: "Info", ja: "情報" },
  "analytics.risk.reviewDebt": { en: "Review Debt", es: "Deuda de repaso", ja: "復習の溜まり" },
  "analytics.risk.cramming": { en: "Cramming Risk", es: "Riesgo de atracón", ja: "詰め込みリスク" },
  "analytics.risk.stagnation": { en: "Stagnation", es: "Estancamiento", ja: "停滞" },
  "analytics.risk.untouched": { en: "Untouched Chapters", es: "Capítulos sin tocar", ja: "未着手チャプター" },
  "analytics.risk.variance": { en: "Study Variance", es: "Variación de estudio", ja: "学習のばらつき" },

  // Retention Calibration
  "analytics.retention.title": { en: "Retention Calibration", es: "Calibración de retención", ja: "記憶の定着度" },
  "analytics.retention.subtitle": { en: "Predicted vs actual recall — calibrate your review intervals", es: "Recuerdo predicho vs real — calibra tus intervalos de repaso", ja: "予測と実際の想起率を比較 — 復習間隔を最適化" },
  "analytics.retention.predicted": { en: "Predicted", es: "Predicho", ja: "予測" },
  "analytics.retention.actual": { en: "Actual", es: "Real", ja: "実際" },
  "analytics.retention.gap": { en: "Gap", es: "Brecha", ja: "差分" },
  "analytics.retention.action": { en: "Action", es: "Acción", ja: "アクション" },
  "analytics.retention.shortenInterval": { en: "Shorten interval", es: "Acortar intervalo", ja: "間隔を短縮" },
  "analytics.retention.extendInterval": { en: "Extend interval", es: "Extender intervalo", ja: "間隔を延長" },
  "analytics.retention.onTrack": { en: "On track", es: "En camino", ja: "順調" },
  "analytics.retention.noData": { en: "Rate your recall in the Review tab to see calibration data.", es: "Califica tu recuerdo en la pestaña Review para ver datos de calibración.", ja: "復習タブで想起度を評価すると定着度データが表示されます。" },

  // Allocation Optimizer
  "analytics.allocation.title": { en: "Weekly Strategy", es: "Estrategia semanal", ja: "週間戦略" },
  "analytics.allocation.subtitle": { en: "Recommended time allocation adjustments", es: "Ajustes recomendados de distribución de tiempo", ja: "おすすめの時間配分" },
  "analytics.allocation.section": { en: "Section", es: "Sección", ja: "セクション" },
  "analytics.allocation.current": { en: "Current", es: "Actual", ja: "現在" },
  "analytics.allocation.recommended": { en: "Recommended", es: "Recomendado", ja: "推奨" },
  "analytics.allocation.change": { en: "Change", es: "Cambio", ja: "変更" },
  "analytics.allocation.reason": { en: "Reason", es: "Razón", ja: "理由" },
  "analytics.allocation.increase": { en: "Increase", es: "Aumentar", ja: "増加" },
  "analytics.allocation.decrease": { en: "Decrease", es: "Disminuir", ja: "減少" },
  "analytics.allocation.maintain": { en: "Maintain", es: "Mantener", ja: "維持" },

  // Coverage
  "analytics.coverage.title": { en: "Coverage Gaps", es: "Brechas de cobertura", ja: "未対策チャプター" },
  "analytics.coverage.subtitle": { en: "Untouched and fragile chapters requiring attention", es: "Capítulos sin tocar y frágiles que requieren atención", ja: "注意が必要な未着手・定着不足のチャプター" },
  "analytics.coverage.untouched": { en: "Untouched", es: "Sin tocar", ja: "未着手" },
  "analytics.coverage.fragile": { en: "Fragile", es: "Frágil", ja: "定着不足" },
  "analytics.coverage.urgent": { en: "Urgent", es: "Urgente", ja: "緊急" },
  "analytics.coverage.normal": { en: "Normal", es: "Normal", ja: "通常" },
  "analytics.coverage.noCoverage": { en: "All chapters are covered. Great job!", es: "Todos los capítulos están cubiertos. ¡Excelente trabajo!", ja: "全チャプターがカバーされています。素晴らしい！" },

  // Drill-Down
  "analytics.drilldown.title": { en: "Chapter Detail", es: "Detalle del capítulo", ja: "チャプター詳細" },
  "analytics.drilldown.subtitle": { en: "Accuracy trend per chapter over time", es: "Tendencia de precisión por capítulo a lo largo del tiempo", ja: "チャプターごとの正答率の推移" },

  // ── Review Recall Rating ──────────────────────────────────────
  "review.recall.title": { en: "How well did you recall?", es: "¿Qué tan bien recordaste?", ja: "どのくらい覚えていましたか？" },
  "review.recall.0": { en: "Forgot", es: "Olvidé", ja: "忘れた" },
  "review.recall.1": { en: "Hard", es: "Difícil", ja: "難しい" },
  "review.recall.2": { en: "OK", es: "OK", ja: "普通" },
  "review.recall.3": { en: "Easy", es: "Fácil", ja: "簡単" },
  "review.recall.rated": { en: "Rated", es: "Calificado", ja: "評価済み" },

  // ── Sidebar / Mobile Header ─────────────────────────────────────
  "nav.dashboard": { en: "Dashboard", es: "Panel", ja: "ダッシュボード" },
  "nav.chapters": { en: "Chapters", es: "Capítulos", ja: "チャプター" },
  "nav.studyLog": { en: "Study Log", es: "Registro", ja: "学習記録" },
  "nav.mockExams": { en: "Practice Exam", es: "Examen de práctica", ja: "模擬試験" },
  "nav.review": { en: "Review", es: "Repaso", ja: "復習" },
  "nav.analytics": { en: "Analytics", es: "Analíticas", ja: "分析" },
  "nav.settings": { en: "Settings", es: "Ajustes", ja: "設定" },
  "nav.home": { en: "Home", es: "Inicio", ja: "ホーム" },
  "nav.log": { en: "Log", es: "Registro", ja: "記録" },
  "nav.mock": { en: "Practice", es: "Práctica", ja: "模試" },
  "sidebar.studyPlatform": { en: "Study Platform", es: "Plataforma de estudio", ja: "USCPA学習プラットフォーム" },
  "sidebar.studyStreak": { en: "Study Streak", es: "Racha de estudio", ja: "連続学習日数" },
  "sidebar.days": { en: "days", es: "días", ja: "日" },
  "sidebar.collapse": { en: "Collapse", es: "Colapsar", ja: "折りたたむ" },
  "sidebar.navigation": { en: "Navigation", es: "Navegación", ja: "ナビゲーション" },
  "sidebar.switchToEnglish": { en: "Switch to English", es: "Cambiar a inglés", ja: "英語に切り替え" },
  "sidebar.switchToSpanish": { en: "Switch to Spanish", es: "Cambiar a español", ja: "スペイン語に切り替え" },
  "sidebar.switchToJapanese": { en: "Switch to Japanese", es: "Cambiar a japonés", ja: "日本語に切り替え" },
  "sidebar.lightMode": { en: "Light mode", es: "Modo claro", ja: "ライトモード" },
  "sidebar.darkMode": { en: "Dark mode", es: "Modo oscuro", ja: "ダークモード" },

  // ── Dashboard ───────────────────────────────────────────────────
  "dashboard.title": { en: "Study Overview", es: "Resumen de estudio", ja: "学習概要" },
  "dashboard.subtitle": { en: "Track your USCPA exam preparation progress across all sections.", es: "Sigue el progreso de tu preparación para el examen USCPA en todas las secciones.", ja: "USCPA全セクションの学習進捗をまとめて確認。" },
  "dashboard.totalStudyHours": { en: "Total Study Hours", es: "Horas totales de estudio", ja: "合計学習時間" },
  "dashboard.daysActive": { en: "days active", es: "días activos", ja: "日間学習" },
  "dashboard.studyStreak": { en: "Study Streak", es: "Racha de estudio", ja: "連続学習日数" },
  "dashboard.dayInARow": { en: "day in a row", es: "día consecutivo", ja: "日連続" },
  "dashboard.daysInARow": { en: "days in a row", es: "días consecutivos", ja: "日連続" },
  "dashboard.last14Days": { en: "Last 14 days", es: "Últimos 14 días", ja: "過去14日間" },
  "dashboard.weeklyStudyHours": { en: "Weekly Study Hours", es: "Horas de estudio semanal", ja: "週間学習時間" },
  "dashboard.weeklySubtitle": { en: "Hours studied per day (last 7 days)", es: "Horas estudiadas por día (últimos 7 días)", ja: "日別学習時間（過去7日間）" },
  "dashboard.viewDetails": { en: "View Details", es: "Ver detalles", ja: "詳細を見る" },
  "dashboard.studyHours": { en: "Study Hours", es: "Horas de estudio", ja: "学習時間" },
  "dashboard.dAgo": { en: "d ago", es: "d atrás", ja: "日前" },
  "dashboard.chaptersStudied": { en: "chapters studied", es: "capítulos estudiados", ja: "チャプター学習済み" },
  "dashboard.recentStudySessions": { en: "Recent Study Sessions", es: "Sesiones de estudio recientes", ja: "最近の学習セッション" },
  "dashboard.viewAllLogs": { en: "View all study logs", es: "Ver todos los registros", ja: "すべての学習記録を見る" },
  "dashboard.recentInsights": { en: "Recent Insights", es: "Notas recientes", ja: "最近の重要ポイント" },
  "dashboard.noEssenceNotes": { en: "No essence notes yet for this section.", es: "Aún no hay notas para esta sección.", ja: "このセクションのエッセンスノートはまだありません。" },
  "dashboard.viewChapters": { en: "View chapters", es: "Ver capítulos", ja: "チャプターを見る" },
  "dashboard.today": { en: "Today", es: "Hoy", ja: "今日" },
  "dashboard.yesterday": { en: "Yesterday", es: "Ayer", ja: "昨日" },

  // Dashboard review help
  "dashboard.reviewHelp.title": { en: "Chapters that most need review right now:", es: "Capítulos que más necesitan repaso ahora:", ja: "今すぐ復習が必要なチャプター:" },
  "dashboard.reviewHelp.retentionBar": { en: "Retention Bar", es: "Barra de retención", ja: "定着率ゲージ" },
  "dashboard.reviewHelp.retentionBarDesc": { en: "How much you remember. Red = urgent, green = well retained.", es: "Cuánto recuerdas del capítulo. Rojo = urgente, verde = bien retenido.", ja: "どれくらい覚えているか。赤 = 緊急、緑 = 定着良好。" },
  "dashboard.reviewHelp.masteryLevel": { en: "Mastery Level", es: "Nivel de dominio", ja: "習熟度" },
  "dashboard.reviewHelp.masteryLevelDesc": { en: "New → Learning → Reviewing → Mastered. Based on how many times you've reviewed.", es: "New → Learning → Reviewing → Mastered. Basado en cuántas veces has repasado.", ja: "New → Learning → Reviewing → Mastered。復習回数に基づく。" },
  "dashboard.reviewHelp.daysAgo": { en: "Days Ago", es: "Días atrás", ja: "経過日数" },
  "dashboard.reviewHelp.daysAgoDesc": { en: "How long since you last studied this chapter.", es: "Cuánto tiempo desde tu último estudio de este capítulo.", ja: "最後にこのチャプターを学習してからの日数。" },
  "dashboard.reviewHelp.footer": { en: "Sorted by urgency — review the top ones first. Click 'View Schedule' for the full review calendar.", es: "Ordenados por urgencia — repasa los de arriba primero. Haz clic en 'View Schedule' para ver el calendario completo.", ja: "緊急度順 — 上位から優先的に復習。完全な復習カレンダーは「スケジュールを見る」をクリック。" },

  // ── Chapters ────────────────────────────────────────────────────
  "chapters.title": { en: "Chapters", es: "Capítulos", ja: "チャプター" },
  "chapters.subtitle": { en: "Track your study progress by chapter. Click a chapter to view details and record study sessions.", es: "Sigue tu progreso de estudio por capítulo. Haz clic en un capítulo para ver detalles y registrar sesiones.", ja: "チャプター別の学習進捗を確認。チャプターをクリックして詳細表示・学習記録。" },
  "chapters.totalChapters": { en: "Total Chapters", es: "Total de capítulos", ja: "チャプター数" },
  "chapters.studied": { en: "Studied", es: "Estudiados", ja: "学習済み" },
  "chapters.totalStudyTime": { en: "Total Study Time", es: "Tiempo total", ja: "合計学習時間" },
  "chapters.overallAccuracy": { en: "Overall Accuracy", es: "Precisión general", ja: "総合正答率" },
  "chapters.allSections": { en: "All Sections", es: "Todas las secciones", ja: "全セクション" },
  "chapters.completed": { en: "Completed", es: "Completado", ja: "完了" },
  "chapters.chaptersCount": { en: "chapters", es: "capítulos", ja: "チャプター" },
  "chapters.studiedSuffix": { en: "studied", es: "estudiados", ja: "学習済み" },
  "chapters.accuracy": { en: "Accuracy", es: "Precisión", ja: "正答率" },
  "chapters.studyHoursSummary": { en: "Study Hours Summary by Chapter", es: "Resumen de horas de estudio por capítulo", ja: "チャプター別学習時間サマリー" },
  "chapters.grandTotal": { en: "Grand Total", es: "Total general", ja: "総合計" },

  // ── Chapter Detail ──────────────────────────────────────────────
  "chapterDetail.backToChapters": { en: "Back to Chapters", es: "Volver a capítulos", ja: "チャプター一覧に戻る" },
  "chapterDetail.chapter": { en: "Chapter", es: "Capítulo", ja: "チャプター" },
  "chapterDetail.sessions": { en: "Sessions", es: "Sesiones", ja: "セッション" },
  "chapterDetail.studyTime": { en: "Study Time", es: "Tiempo de estudio", ja: "学習時間" },
  "chapterDetail.questions": { en: "Questions", es: "Preguntas", ja: "問題数" },
  "chapterDetail.accuracy": { en: "Accuracy", es: "Precisión", ja: "正答率" },
  "chapterDetail.studyLog": { en: "Study Log", es: "Registro de estudio", ja: "学習記録" },
  "chapterDetail.add": { en: "Add", es: "Añadir", ja: "追加" },
  "chapterDetail.date": { en: "Date", es: "Fecha", ja: "日付" },
  "chapterDetail.hours": { en: "Hours", es: "Horas", ja: "時間" },
  "chapterDetail.hoursPlaceholder": { en: "e.g. 2.0", es: "ej. 2.0", ja: "例: 2.0" },
  "chapterDetail.mc": { en: "MC (Multiple Choice)", es: "MC (Opción múltiple)", ja: "MC（選択問題）" },
  "chapterDetail.tbs": { en: "TBS (Task-Based Simulations)", es: "TBS (Simulaciones)", ja: "TBS（シミュレーション問題）" },
  "chapterDetail.questionsLabel": { en: "Questions", es: "Preguntas", ja: "問題数" },
  "chapterDetail.correct": { en: "Correct", es: "Correctas", ja: "正解数" },
  "chapterDetail.total": { en: "Total", es: "Total", ja: "合計" },
  "chapterDetail.memo": { en: "Memo", es: "Notas", ja: "メモ" },
  "chapterDetail.memoPlaceholder": { en: "What did you study today?", es: "¿Qué estudiaste hoy?", ja: "今日何を学習しましたか？" },
  "chapterDetail.recordSession": { en: "Record Session", es: "Registrar sesión", ja: "セッションを記録" },
  "chapterDetail.cancel": { en: "Cancel", es: "Cancelar", ja: "キャンセル" },
  "chapterDetail.noSessions": { en: "No study sessions recorded yet.", es: "Aún no hay sesiones registradas.", ja: "学習セッションはまだ記録されていません。" },
  "chapterDetail.addFirst": { en: "Click \"Add\" to record your first session.", es: "Haz clic en \"Añadir\" para registrar tu primera sesión.", ja: "「追加」をクリックして最初のセッションを記録しましょう。" },
  "chapterDetail.totalSummary": { en: "Total: {q} questions, {c} correct ({p}%)", es: "Total: {q} preguntas, {c} correctas ({p}%)", ja: "合計: {q}問中{c}問正解（{p}%）" },

  // ── Study Log ───────────────────────────────────────────────────
  "studyLog.title": { en: "Study Log", es: "Registro de estudio", ja: "学習記録" },
  "studyLog.subtitle": { en: "Record and track your daily study sessions by subject and chapter.", es: "Registra y sigue tus sesiones de estudio diarias por materia y capítulo.", ja: "科目・チャプター別に毎日の学習セッションを記録・追跡。" },
  "studyLog.totalSessions": { en: "Total Sessions", es: "Total sesiones", ja: "総セッション数" },
  "studyLog.studyDays": { en: "Study Days", es: "Días de estudio", ja: "学習日数" },
  "studyLog.totalHours": { en: "Total Hours", es: "Horas totales", ja: "合計時間" },
  "studyLog.newEntry": { en: "New Entry", es: "Nueva entrada", ja: "新規記録" },
  "studyLog.newStudyEntry": { en: "New Study Entry", es: "Nueva entrada de estudio", ja: "新しい学習記録" },
  "studyLog.date": { en: "Date", es: "Fecha", ja: "日付" },
  "studyLog.section": { en: "Section", es: "Sección", ja: "セクション" },
  "studyLog.chapter": { en: "Chapter", es: "Capítulo", ja: "チャプター" },
  "studyLog.selectChapter": { en: "Select a chapter...", es: "Selecciona un capítulo...", ja: "チャプターを選択..." },
  "studyLog.studyHours": { en: "Study Hours", es: "Horas de estudio", ja: "学習時間" },
  "studyLog.hoursPlaceholder": { en: "e.g. 2.0", es: "ej. 2.0", ja: "例: 2.0" },
  "studyLog.mc": { en: "MC (Multiple Choice)", es: "MC (Opción múltiple)", ja: "MC（選択問題）" },
  "studyLog.tbs": { en: "TBS (Task-Based Simulations)", es: "TBS (Simulaciones)", ja: "TBS（シミュレーション問題）" },
  "studyLog.questions": { en: "Questions", es: "Preguntas", ja: "問題数" },
  "studyLog.correct": { en: "Correct", es: "Correctas", ja: "正解数" },
  "studyLog.memoNotes": { en: "Memo / Notes", es: "Notas / Memo", ja: "メモ / ノート" },
  "studyLog.memoPlaceholder": { en: "What did you study? What needs more review?", es: "¿Qué estudiaste? ¿Qué necesita más repaso?", ja: "何を学習しましたか？復習が必要な点は？" },
  "studyLog.addEntry": { en: "Add Study Log Entry", es: "Agregar entrada", ja: "学習記録を追加" },
  "studyLog.allSections": { en: "All Sections", es: "Todas las secciones", ja: "全セクション" },
  "studyLog.weeklySummary": { en: "Weekly Summary", es: "Resumen semanal", ja: "週間サマリー" },
  "studyLog.hTotal": { en: "h total", es: "h total", ja: "時間合計" },
  "studyLog.vsPrev": { en: "prev", es: "anterior", ja: "前週" },
  "studyLog.noLogs": { en: "No study logs yet. Click \"New Entry\" to start recording.", es: "Aún no hay registros. Haz clic en \"Nueva entrada\" para comenzar.", ja: "学習記録がまだありません。「新規記録」をクリックして始めましょう。" },
  "studyLog.session": { en: "session", es: "sesión", ja: "セッション" },
  "studyLog.sessions": { en: "sessions", es: "sesiones", ja: "セッション" },
  "studyLog.today": { en: "Today", es: "Hoy", ja: "今日" },
  "studyLog.yesterday": { en: "Yesterday", es: "Ayer", ja: "昨日" },
  "studyLog.noStudySessions": { en: "No study sessions this week", es: "Sin sesiones de estudio esta semana", ja: "今週の学習セッションなし" },
  "studyLog.weekComment.noSessions": { en: "No study sessions", es: "Sin sesiones de estudio", ja: "学習セッションなし" },
  "studyLog.weekComment.heavyMC": { en: "Heavy MC ({n}%)", es: "Mucho MC ({n}%)", ja: "MC偏重（{n}%）" },
  "studyLog.weekComment.heavyTBS": { en: "Heavy TBS ({n}%)", es: "Mucho TBS ({n}%)", ja: "TBS偏重（{n}%）" },
  "studyLog.weekComment.goodBalance": { en: "Good MC/TBS balance", es: "Buen equilibrio MC/TBS", ja: "MC/TBSバランス良好" },
  "studyLog.weekComment.hoursDown": { en: "Hours down {n}% vs last week", es: "Horas bajaron {n}% vs semana pasada", ja: "学習時間が先週比{n}%減少" },
  "studyLog.weekComment.hoursUp": { en: "Hours up {n}% vs last week", es: "Horas subieron {n}% vs semana pasada", ja: "学習時間が先週比{n}%増加" },
  "chapterDetail.clickAdd": { en: "Click \"Add\" to record your first session.", es: "Haz clic en \"Añadir\" para registrar tu primera sesión.", ja: "「追加」をクリックして最初のセッションを記録。" },
  "studyLog.total": { en: "Total", es: "Total", ja: "合計" },
  "studyLog.questionsTotal": { en: "questions", es: "preguntas", ja: "問" },
  "studyLog.correctTotal": { en: "correct", es: "correctas", ja: "正解" },
  "studyLog.accuracy": { en: "accuracy", es: "precisión", ja: "正答率" },
  "studyLog.heavyOnMC": { en: "Heavy on MC", es: "Mucho MC", ja: "MC偏重" },
  "studyLog.considerTBS": { en: "consider more TBS practice", es: "considera más práctica de TBS", ja: "TBSの練習を増やしましょう" },
  "studyLog.heavyOnTBS": { en: "Heavy on TBS", es: "Mucho TBS", ja: "TBS偏重" },
  "studyLog.considerMC": { en: "consider more MC practice", es: "considera más práctica de MC", ja: "MCの練習を増やしましょう" },
  "studyLog.goodBalance": { en: "Good balance across MC/TBS", es: "Buen equilibrio entre MC/TBS", ja: "MC/TBSのバランスが良好" },
  "studyLog.hoursDown": { en: "Total hours down", es: "Horas totales bajaron", ja: "合計学習時間減少" },
  "studyLog.hoursUp": { en: "Total hours up", es: "Horas totales subieron", ja: "合計学習時間増加" },
  "studyLog.vsLastWeek": { en: "vs last week", es: "vs semana pasada", ja: "先週比" },
  "studyLog.editEntry": { en: "Edit Entry", es: "Editar entrada", ja: "記録を編集" },
  "studyLog.editStudyEntry": { en: "Edit Study Entry", es: "Editar entrada de estudio", ja: "学習記録を編集" },
  "studyLog.updateEntry": { en: "Update Entry", es: "Actualizar entrada", ja: "記録を更新" },
  "studyLog.cancelEdit": { en: "Cancel", es: "Cancelar", ja: "キャンセル" },

  // Study log charts
  "studyLog.chart.thisWeek": { en: "This Week", es: "Esta semana", ja: "今週" },
  "studyLog.chart.last8Weeks": { en: "Last 8 Weeks", es: "Últimas 8 semanas", ja: "過去8週間" },
  "studyLog.chart.weekly": { en: "Weekly", es: "Semanal", ja: "週間" },
  "studyLog.chart.monthly": { en: "Monthly", es: "Mensual", ja: "月間" },
  "studyLog.chart.helpTitle": { en: "Visualize your study patterns:", es: "Visualiza tus patrones de estudio:", ja: "学習パターンを可視化:" },
  "studyLog.chart.stackedBars": { en: "Stacked Bars", es: "Barras apiladas", ja: "セクション別" },
  "studyLog.chart.stackedBarsDesc": { en: "Study hours by section (FAR, AUD, REG, etc.) stacked per day or week.", es: "Horas de estudio por sección (FAR, AUD, REG, etc.) apiladas por día o semana.", ja: "FAR・AUD・REGなどセクション別の学習時間を日/週ごとに表示。" },
  "studyLog.chart.trendLine": { en: "Trend Line", es: "Línea de tendencia", ja: "推移" },
  "studyLog.chart.trendLineDesc": { en: "Total study hours per period to track your consistency.", es: "Total de horas de estudio por período para ver tu consistencia.", ja: "期間ごとの合計学習時間の推移を確認。" },
  "studyLog.chart.weeklyMonthlyDesc": { en: "Switch between weekly (7 days) and monthly (8 weeks) view.", es: "Cambia entre vista semanal (7 días) y mensual (8 semanas).", ja: "週間（7日間）と月間（8週間）の表示を切り替え。" },
  "studyLog.chart.studyHoursBySection": { en: "Study Hours by Section", es: "Horas de estudio por sección", ja: "セクション別学習時間" },
  "studyLog.chart.studyHoursTrend": { en: "Study Hours Trend", es: "Tendencia de horas de estudio", ja: "学習時間の推移" },
  "studyLog.chart.studyHours": { en: "Study Hours", es: "Horas de estudio", ja: "学習時間" },
  "studyLog.chart.noData": { en: "No data for this period", es: "Sin datos para este período", ja: "この期間のデータはありません" },
  "studyLog.chart.goal": { en: "Goal", es: "Meta", ja: "目標" },
  "studyLog.chart.edit": { en: "Edit", es: "Editar", ja: "編集" },

  // ── Essence Notes ───────────────────────────────────────────────
  "essence.coreConcept": { en: "Core Concept", es: "Concepto clave", ja: "重要概念" },
  "essence.framework": { en: "Framework", es: "Marco", ja: "フレームワーク" },
  "essence.pitfall": { en: "Pitfall", es: "Trampa", ja: "落とし穴" },
  "essence.memoryRule": { en: "Memory Rule", es: "Regla mnemotécnica", ja: "記憶術" },
  "essence.title": { en: "Essence Notes", es: "Notas esenciales", ja: "エッセンスノート" },
  "essence.screenshot": { en: "Screenshot", es: "Captura", ja: "スクリーンショット" },
  "essence.pasteText": { en: "Paste Text", es: "Pegar texto", ja: "テキスト貼り付け" },
  "essence.images": { en: "image", es: "imagen", ja: "枚" },
  "essence.imagesPlural": { en: "images", es: "imágenes", ja: "枚" },
  "essence.clear": { en: "Clear", es: "Limpiar", ja: "クリア" },
  "essence.uploadPrompt": { en: "Upload or paste screenshots (Cmd+V)", es: "Sube o pega capturas (Cmd+V)", ja: "スクリーンショットをアップロードまたは貼り付け（Cmd+V）" },
  "essence.addImage": { en: "Add image", es: "Añadir imagen", ja: "画像を追加" },
  "essence.pasteMCQ": { en: "Paste MCQ or text content directly", es: "Pega contenido MCQ o texto directamente", ja: "MCQやテキストを直接貼り付け" },
  "essence.pastePlaceholder": { en: "Paste the question, options, and explanation as-is.\nExample:\nWhich of the following is correct regarding...\nA. ...\nB. ...\nC. ...\nD. ...\n\nExplanation: The correct answer is B because...", es: "Pega la pregunta, opciones y explicación tal cual.\nEjemplo:\n¿Cuál de las siguientes es correcta respecto a...?\nA. ...\nB. ...\nC. ...\nD. ...\n\nExplicación: La respuesta correcta es B porque...", ja: "問題文、選択肢、解説をそのまま貼り付けてください。\n例:\n次のうち正しいものはどれか...\nA. ...\nB. ...\nC. ...\nD. ...\n\n解説: 正解はBです。なぜなら..." },
  "essence.chars": { en: "chars", es: "caracteres", ja: "文字" },
  "essence.analyzing": { en: "Analyzing...", es: "Analizando...", ja: "分析中..." },
  "essence.extractInsights": { en: "Extract Insights with AI", es: "Extraer con IA", ja: "AIで要点を抽出" },
  "essence.imageTime": { en: "(1-2 min)", es: "(1-2 min)", ja: "（1〜2分）" },
  "essence.textTime": { en: "(30s-1 min)", es: "(30s-1 min)", ja: "（30秒〜1分）" },
  "essence.aiResults": { en: "AI Results", es: "Resultados de IA", ja: "AI分析結果" },
  "essence.demo": { en: "DEMO", es: "DEMO", ja: "デモ" },
  "essence.saveAll": { en: "Save All", es: "Guardar todo", ja: "すべて保存" },
  "essence.save": { en: "Save", es: "Guardar", ja: "保存" },
  "essence.all": { en: "All", es: "Todos", ja: "すべて" },
  "essence.noNotes": { en: "No notes yet", es: "Sin notas aún", ja: "ノートはまだありません" },
  "essence.noNotesDesc": { en: "Upload screenshots to extract key insights with AI", es: "Sube capturas para extraer ideas clave con IA", ja: "スクリーンショットをアップロードしてAIで要点を抽出" },
  "essence.hide": { en: "Hide", es: "Ocultar", ja: "非表示" },
  "essence.source": { en: "Source", es: "Fuente", ja: "出典" },
  "essence.textbook": { en: "Textbook", es: "Libro de texto", ja: "テキスト" },
  "essence.mcq": { en: "MCQ", es: "MCQ", ja: "MCQ" },
  "essence.tbsSim": { en: "TBS Simulation", es: "Simulación TBS", ja: "TBSシミュレーション" },
  "essence.other": { en: "Other", es: "Otro", ja: "その他" },
  "essence.extractingText": { en: "Extracting text...", es: "Extrayendo texto...", ja: "テキスト抽出中..." },
  "essence.loadingImages": { en: "Loading images...", es: "Cargando imágenes...", ja: "画像読み込み中..." },
  "essence.aiAnalyzing": { en: "AI analyzing content...", es: "IA analizando contenido...", ja: "AIがコンテンツを分析中..." },
  "essence.extractingInsights": { en: "Extracting key insights...", es: "Extrayendo ideas clave...", ja: "重要な要点を抽出中..." },
  "essence.structuringInsights": { en: "Structuring insights...", es: "Estructurando ideas...", ja: "要点を整理中..." },
  "essence.almostThere": { en: "Almost there...", es: "Casi listo...", ja: "もうすぐ完了..." },

  // Essence notes guide
  "essence.guide.whatTitle": { en: "What is Essence Notes?", es: "¿Qué es Essence Notes?", ja: "Essence Notesとは？" },
  "essence.guide.whatDesc": { en: "Essence Notes uses AI to analyze your study materials (screenshots or text) and automatically extract the key concepts, exam traps, and decision frameworks you need to pass the CPA exam. Instead of taking notes manually, AI identifies exactly what matters for exam day.", es: "Essence Notes usa IA para analizar tus materiales de estudio (capturas de pantalla o texto) y extraer automáticamente los conceptos clave, trampas de examen y marcos de decisión que necesitas para aprobar el CPA. En lugar de tomar notas manualmente, la IA identifica exactamente qué es importante para el examen.", ja: "AIが学習教材（スクリーンショットやテキスト）を分析し、CPA試験に必要な重要概念、出題の落とし穴、判断の枠組みを自動抽出します。手動でノートを取る代わりに、AIが試験の要点を正確に特定します。" },
  "essence.guide.howTitle": { en: "How to Use", es: "Cómo usar", ja: "使い方" },
  "essence.guide.step1": { en: "Upload a screenshot of your textbook, MCQ, or TBS — or paste the text directly", es: "Sube una captura de tu libro, MCQ o TBS — o pega el texto directamente", ja: "テキストブック、MCQ、TBSのスクリーンショットをアップロード、またはテキストを直接貼り付け" },
  "essence.guide.step2": { en: "Click \"Extract Insights with AI\" — AI reads the content and identifies exam-critical insights", es: "Haz clic en \"Extraer con IA\" — la IA lee el contenido e identifica ideas críticas para el examen", ja: "「AIで要点を抽出」をクリック — AIが内容を分析し、試験に重要な要点を特定" },
  "essence.guide.step3": { en: "Review the results and save the insights you want. They're organized by type for easy review", es: "Revisa los resultados y guarda las ideas que quieras. Se organizan por tipo para repaso fácil", ja: "結果を確認して保存したい要点を選択。種類別に整理され復習しやすい" },
  "essence.guide.insightTypesTitle": { en: "4 Insight Types", es: "4 tipos de insights", ja: "4つのカテゴリ" },
  "essence.guide.conceptDesc": { en: "The WHY behind accounting rules", es: "El PORQUÉ detrás de las reglas contables", ja: "会計ルールの「なぜ」" },
  "essence.guide.frameworkDesc": { en: "Step-by-step decision trees", es: "Árboles de decisión paso a paso", ja: "ステップバイステップの判断フロー" },
  "essence.guide.trapDesc": { en: "Where candidates lose points", es: "Donde los candidatos pierden puntos", ja: "受験者が失点しやすいポイント" },
  "essence.guide.ruleDesc": { en: "Thresholds & mnemonics", es: "Umbrales y mnemotécnicos", ja: "閾値と記憶術" },
  "essence.guide.examplesTitle": { en: "Example Generated Notes", es: "Ejemplos de notas generadas", ja: "生成されたノートの例" },
  "essence.guide.examplesFooter": { en: "↑ These are examples. Your actual content will generate insights specific to the material you upload.", es: "↑ Estos son ejemplos. Tu contenido real generará insights específicos para el material que subas.", ja: "↑ これらは例です。実際にアップロードした教材に応じた要点が生成されます。" },

  // ── Settings ────────────────────────────────────────────────────
  "settings.title": { en: "Settings", es: "Ajustes", ja: "設定" },
  "settings.subtitle": { en: "Configure your study preferences and exam targets.", es: "Configura tus preferencias de estudio y metas de examen.", ja: "学習の設定と試験目標を管理。" },
  "settings.profile": { en: "Profile", es: "Perfil", ja: "プロフィール" },
  "settings.removePhoto": { en: "Remove photo", es: "Eliminar foto", ja: "写真を削除" },
  "settings.fullName": { en: "Full Name", es: "Nombre completo", ja: "氏名" },
  "settings.fullNamePlaceholder": { en: "Your full name", es: "Tu nombre completo", ja: "氏名を入力" },
  "settings.email": { en: "Email Address", es: "Correo electrónico", ja: "メールアドレス" },
  "settings.emailPlaceholder": { en: "your@email.com", es: "tu@correo.com", ja: "your@email.com" },
  "settings.appearance": { en: "Appearance", es: "Apariencia", ja: "外観" },
  "settings.theme": { en: "Theme", es: "Tema", ja: "テーマ" },
  "settings.light": { en: "Light", es: "Claro", ja: "ライト" },
  "settings.dark": { en: "Dark", es: "Oscuro", ja: "ダーク" },
  "settings.system": { en: "System", es: "Sistema", ja: "システム" },
  "settings.examTarget": { en: "Exam Target by Section", es: "Meta de examen por sección", ja: "セクション別試験目標" },
  "settings.completed": { en: "Completed", es: "Completado", ja: "完了" },
  "settings.markComplete": { en: "Mark Complete", es: "Marcar completo", ja: "完了にする" },
  "settings.examDate": { en: "Exam Date", es: "Fecha de examen", ja: "試験日" },
  "settings.year": { en: "Year", es: "Año", ja: "年" },
  "settings.month": { en: "Mon", es: "Mes", ja: "月" },
  "settings.day": { en: "Day", es: "Día", ja: "日" },
  "settings.targetScore": { en: "Target Score", es: "Puntaje meta", ja: "目標スコア" },
  "settings.passing": { en: "Passing", es: "Aprobado", ja: "合格" },
  "settings.studyPreferences": { en: "Study Preferences", es: "Preferencias de estudio", ja: "学習設定" },
  "settings.dailyGoal": { en: "Daily Study Goal (hours)", es: "Meta diaria (horas)", ja: "1日の学習目標（時間）" },
  "settings.weekdayGoal": { en: "Weekday Goal", es: "Meta (Lun-Vie)", ja: "平日の目標" },
  "settings.weekendGoal": { en: "Weekend Goal", es: "Meta (Sáb-Dom)", ja: "週末の目標" },
  "settings.hour": { en: "hour", es: "hora", ja: "時間" },
  "settings.hours": { en: "hours", es: "horas", ja: "時間" },
  "settings.questionsPerSession": { en: "Questions per Session", es: "Preguntas por sesión", ja: "セッションあたりの問題数" },
  "settings.questionsUnit": { en: "questions", es: "preguntas", ja: "問" },
  "settings.notifications": { en: "Notifications", es: "Notificaciones", ja: "通知" },
  "settings.reviewAlerts": { en: "Review alerts", es: "Alertas de repaso", ja: "復習アラート" },
  "settings.weeklyReport": { en: "Weekly progress report", es: "Informe semanal de progreso", ja: "週間進捗レポート" },
  "settings.streakNotifications": { en: "Streak notifications", es: "Notificaciones de racha", ja: "連続学習の通知" },
  "settings.milestoneNotifications": { en: "Milestone notifications", es: "Notificaciones de hitos", ja: "マイルストーン通知" },
  "settings.notifBlocked": { en: "Notifications are blocked. Please enable them in your browser settings.", es: "Las notificaciones están bloqueadas. Habilítalas en la configuración de tu navegador.", ja: "通知がブロックされています。ブラウザの設定で有効にしてください。" },

  // Notification content
  "notif.review.title": { en: "Review Alert", es: "Alerta de repaso", ja: "復習アラート" },
  "notif.review.body": { en: "{count} chapters need review. Lowest: {chapter} at {retention}%", es: "{count} capítulos necesitan repaso. Más bajo: {chapter} al {retention}%", ja: "{count}チャプターの復習が必要。最低: {chapter}（{retention}%）" },
  "notif.streak.title": { en: "Streak at Risk!", es: "Racha en riesgo!", ja: "連続記録が危険！" },
  "notif.streak.body": { en: "Your {streak}-day streak is at risk! Study today to keep it going.", es: "Tu racha de {streak} días está en riesgo! Estudia hoy para mantenerla.", ja: "{streak}日連続の記録が途切れそうです！今日学習して継続しましょう。" },
  "notif.weekly.title": { en: "Weekly Summary", es: "Resumen semanal", ja: "週間サマリー" },
  "notif.weekly.body": { en: "Last week: {hours}h, {sessions} sessions, {accuracy}% accuracy", es: "Semana pasada: {hours}h, {sessions} sesiones, {accuracy}% precisión", ja: "先週: {hours}時間、{sessions}セッション、正答率{accuracy}%" },
  "notif.milestone.streak": { en: "You've maintained a {n}-day streak!", es: "Has mantenido una racha de {n} días!", ja: "{n}日連続学習を達成しました！" },
  "notif.milestone.hours": { en: "You've studied for {n} hours total!", es: "Has estudiado {n} horas en total!", ja: "累計{n}時間の学習を達成しました！" },
  "notif.milestone.title": { en: "Milestone Reached!", es: "Hito alcanzado!", ja: "マイルストーン達成！" },
  "settings.saved": { en: "Saved!", es: "¡Guardado!", ja: "保存しました！" },
  "settings.saveChanges": { en: "Save Changes", es: "Guardar cambios", ja: "変更を保存" },
  "settings.changePassword": { en: "Change Password", es: "Cambiar contraseña", ja: "パスワード変更" },
  "settings.currentPassword": { en: "Current Password", es: "Contraseña actual", ja: "現在のパスワード" },
  "settings.newPassword": { en: "New Password", es: "Nueva contraseña", ja: "新しいパスワード" },
  "settings.passwordMinLength": { en: "Password must be at least 8 characters", es: "La contraseña debe tener al menos 8 caracteres", ja: "パスワードは8文字以上必要です" },
  "settings.passwordMinLengthHint": { en: "Min. 8 characters", es: "Mín. 8 caracteres", ja: "8文字以上" },
  "settings.passwordChanged": { en: "Password updated successfully", es: "Contraseña actualizada", ja: "パスワードを更新しました" },
  "settings.passwordError": { en: "Failed to update password", es: "Error al actualizar contraseña", ja: "パスワードの更新に失敗しました" },
  "settings.updatePassword": { en: "Update Password", es: "Actualizar contraseña", ja: "パスワードを更新" },

  // ── Review (remaining) ──────────────────────────────────────────
  "review.title": { en: "Review Schedule", es: "Calendario de repaso", ja: "復習スケジュール" },
  "review.allSections": { en: "All Sections", es: "Todas las secciones", ja: "全セクション" },
  "review.dAgo": { en: "d ago", es: "d atrás", ja: "日前" },
  "review.next": { en: "Next", es: "Sig.", ja: "次回" },
  "review.reviews": { en: "reviews", es: "repasos", ja: "回復習" },
  "review.today": { en: "Today", es: "Hoy", ja: "今日" },
  "review.tomorrow": { en: "Tomorrow", es: "Mañana", ja: "明日" },

  // ── Mastery Levels (for components) ─────────────────────────────
  "mastery.new": { en: "New", es: "Nuevo", ja: "新規" },
  "mastery.learning": { en: "Learning", es: "Aprendiendo", ja: "学習中" },
  "mastery.reviewing": { en: "Reviewing", es: "Repasando", ja: "復習中" },
  "mastery.mastered": { en: "Mastered", es: "Dominado", ja: "習得済み" },

  // ── Common ──────────────────────────────────────────────────────
  "common.allSections": { en: "All Sections", es: "Todas las secciones", ja: "全セクション" },
  "common.today": { en: "Today", es: "Hoy", ja: "今日" },
  "common.yesterday": { en: "Yesterday", es: "Ayer", ja: "昨日" },

  // ── Analytics Engine (risk texts) ───────────────────────────────
  "risk.reviewDebt.critical.title": { en: "{n} chapters overdue", es: "{n} capítulos vencidos", ja: "{n}チャプターが期限超過" },
  "risk.reviewDebt.critical.desc": { en: "{n} chapters have retention below 30%. Memory is fading rapidly.", es: "{n} capítulos tienen retención por debajo del 30%. La memoria se deteriora rápidamente.", ja: "{n}チャプターの定着率が30%未満です。記憶が急速に薄れています。" },
  "risk.reviewDebt.critical.rx": { en: "Prioritize reviewing overdue chapters before studying new material.", es: "Prioriza repasar los capítulos vencidos antes de estudiar material nuevo.", ja: "新しい教材に取り組む前に、期限超過のチャプターの復習を優先してください。" },
  "risk.reviewDebt.warning.title": { en: "{n} chapters overdue", es: "{n} capítulos vencidos", ja: "{n}チャプターが期限超過" },
  "risk.reviewDebt.warning.desc": { en: "{n} chapters need review soon to prevent forgetting.", es: "{n} capítulos necesitan repaso pronto para evitar el olvido.", ja: "{n}チャプターの忘却を防ぐため、早めの復習が必要です。" },
  "risk.reviewDebt.warning.rx": { en: "Schedule 30 minutes daily for overdue reviews.", es: "Programa 30 minutos diarios para repasos pendientes.", ja: "期限超過の復習に毎日30分を確保しましょう。" },
  "risk.cramming.allNew.title": { en: "All new material, no reviews", es: "Solo material nuevo, sin repasos", ja: "新規教材のみ、復習なし" },
  "risk.cramming.allNew.desc": { en: "In the last {d} days you studied {n} new chapters without reviewing any.", es: "En los últimos {d} días estudiaste {n} capítulos nuevos sin repasar ninguno.", ja: "過去{d}日間で{n}チャプターの新規学習をしましたが、復習はゼロです。" },
  "risk.cramming.allNew.rx": { en: "Use the 70/30 rule: 70% new material, 30% reviews.", es: "Usa la regla 70/30: 70% material nuevo, 30% repasos.", ja: "70/30ルールを使いましょう：新規教材70%、復習30%。" },
  "risk.cramming.ratio.title": { en: "New:Review ratio too high", es: "Proporción nuevo:repaso demasiado alta", ja: "新規:復習の比率が高すぎ" },
  "risk.cramming.ratio.desc": { en: "Ratio is {r}:1. You're learning too fast without reinforcing.", es: "La proporción es {r}:1. Estás aprendiendo demasiado rápido sin reforzar.", ja: "比率は{r}:1です。定着させずに先に進みすぎています。" },
  "risk.cramming.ratio.rx": { en: "Slow down on new chapters and catch up on reviews.", es: "Reduce capítulos nuevos y ponte al día con los repasos.", ja: "新規チャプターのペースを落とし、復習を追いつかせましょう。" },
  "risk.cramming.consider.title": { en: "Consider more reviews", es: "Considera más repasos", ja: "復習を増やす検討を" },
  "risk.cramming.consider.desc": { en: "New:Review ratio is {r}:1 (ideal < 2.5:1).", es: "Proporción nuevo:repaso es {r}:1 (ideal < 2.5:1).", ja: "新規:復習の比率は{r}:1です（理想は2.5:1未満）。" },
  "risk.cramming.consider.rx": { en: "Add 1-2 review sessions per week to balance learning.", es: "Agrega 1-2 sesiones de repaso por semana para equilibrar.", ja: "バランスを取るため、週1〜2回の復習セッションを追加しましょう。" },
  "risk.stagnation.warning.title": { en: "{n} chapters not improving", es: "{n} capítulos sin mejorar", ja: "{n}チャプターが改善なし" },
  "risk.stagnation.warning.desc": { en: "Multiple chapters show no accuracy improvement despite repeated reviews.", es: "Varios capítulos no muestran mejora en precisión a pesar de repasos repetidos.", ja: "複数のチャプターで繰り返し復習しても正答率が改善していません。" },
  "risk.stagnation.warning.rx": { en: "Try different study methods: watch videos, practice TBS, or teach the concept.", es: "Prueba diferentes métodos: videos, práctica TBS o enseña el concepto.", ja: "異なる学習方法を試しましょう：動画視聴、TBS演習、概念を人に教えるなど。" },
  "risk.stagnation.info.title": { en: "{n} chapter(s) plateaued", es: "{n} capítulo(s) estancado(s)", ja: "{n}チャプターが停滞中" },
  "risk.stagnation.info.desc": { en: "Some chapters aren't showing improvement with current study approach.", es: "Algunos capítulos no muestran mejora con el enfoque actual.", ja: "現在の学習方法では改善が見られないチャプターがあります。" },
  "risk.stagnation.info.rx": { en: "Consider changing study techniques for these chapters.", es: "Considera cambiar las técnicas de estudio para estos capítulos.", ja: "これらのチャプターの学習方法を変えることを検討してください。" },
  "risk.untouched.critical.title": { en: "{n}% chapters untouched", es: "{n}% de capítulos sin tocar", ja: "{n}%のチャプターが未着手" },
  "risk.untouched.critical.desc": { en: "{a} of {b} chapters haven't been studied yet, with an exam within 30 days.", es: "{a} de {b} capítulos no se han estudiado aún, con un examen en menos de 30 días.", ja: "{b}チャプター中{a}チャプターが未学習で、試験まで30日以内です。" },
  "risk.untouched.critical.rx": { en: "Focus on high-yield chapters and create a rapid coverage plan.", es: "Enfócate en capítulos de alto rendimiento y crea un plan de cobertura rápida.", ja: "重要度の高いチャプターに集中し、短期学習計画を立てましょう。" },
  "risk.untouched.warning.title": { en: "{n}% chapters untouched", es: "{n}% de capítulos sin tocar", ja: "{n}%のチャプターが未着手" },
  "risk.untouched.warning.desc": { en: "{n} chapters haven't been studied yet.", es: "{n} capítulos no se han estudiado aún.", ja: "{n}チャプターがまだ学習されていません。" },
  "risk.untouched.warning.rx": { en: "Increase daily study time or prioritize key chapters.", es: "Aumenta el tiempo de estudio diario o prioriza capítulos clave.", ja: "1日の学習時間を増やすか、重要なチャプターを優先しましょう。" },
  "risk.variance.critical.title": { en: "Highly inconsistent study schedule", es: "Horario de estudio muy inconsistente", ja: "学習スケジュールが非常に不安定" },
  "risk.variance.critical.desc": { en: "Weekly hours vary greatly (CV={n}%). Consistency beats intensity.", es: "Las horas semanales varían mucho (CV={n}%). La constancia supera la intensidad.", ja: "週間学習時間の変動が大きい（CV={n}%）。継続は集中に勝ります。" },
  "risk.variance.critical.rx": { en: "Set a fixed daily study time and stick to it, even if shorter.", es: "Establece un horario fijo de estudio diario y cúmplelo, aunque sea más corto.", ja: "短時間でも毎日決まった時間に学習する習慣をつけましょう。" },
  "risk.variance.warning.title": { en: "Inconsistent study pattern", es: "Patrón de estudio inconsistente", ja: "学習パターンが不安定" },
  "risk.variance.warning.desc": { en: "Study hours fluctuate week to week (CV={n}%).", es: "Las horas de estudio fluctúan semana a semana (CV={n}%).", ja: "週ごとの学習時間にばらつきがあります（CV={n}%）。" },
  "risk.variance.warning.rx": { en: "Try to maintain a more consistent daily routine.", es: "Intenta mantener una rutina diaria más consistente.", ja: "より安定した毎日のルーティンを心がけましょう。" },
  "risk.allocation.paceGood": { en: "Current pace looks good.", es: "El ritmo actual se ve bien.", ja: "現在のペースは良好です。" },
  "risk.allocation.behind": { en: "Behind by {n} days. Increase pace to catch up.", es: "Atrasado por {n} días. Aumenta el ritmo para ponerte al día.", ja: "{n}日遅れています。ペースを上げて追いつきましょう。" },
  "risk.allocation.ahead": { en: "Ahead of schedule. Redistribute time to weaker sections.", es: "Adelantado. Redistribuye tiempo a secciones más débiles.", ja: "予定より前倒しです。弱いセクションに時間を再配分しましょう。" },
  "risk.allocation.overdueReview": { en: "{n} overdue chapters need urgent review.", es: "{n} capítulos vencidos necesitan repaso urgente.", ja: "{n}チャプターの緊急復習が必要です。" },

  // ── Analytics Drill-Down ────────────────────────────────────────
  "analytics.drilldown.session": { en: "Session", es: "Sesión", ja: "セッション" },
  "analytics.drilldown.accuracy": { en: "Accuracy", es: "Precisión", ja: "正答率" },
  "analytics.drilldown.selectChapter": { en: "Select a chapter to view accuracy trend", es: "Selecciona un capítulo para ver la tendencia de precisión", ja: "チャプターを選択して正答率の推移を表示" },
  "analytics.retention.chapter": { en: "Chapter", es: "Capítulo", ja: "チャプター" },

  // Analytics help texts
  "analytics.pace.help.title": { en: "Goal Pace compares your current pace vs what's needed for your exam:", es: "Goal Pace compara tu ritmo actual con el necesario para tu examen:", ja: "現在の学習ペースと試験に必要なペースを比較します：" },
  "analytics.pace.help.barChart": { en: "Bar Chart", es: "Gráfico de barras", ja: "棒グラフ" },
  "analytics.pace.help.barChartDesc": { en: "Light bars show required weekly hours, dark bars show your actual hours.", es: "Las barras claras son horas semanales requeridas, las oscuras son tus horas reales.", ja: "薄い棒は必要な週間学習時間、濃い棒は実際の学習時間。" },
  "analytics.pace.help.remainingChapters": { en: "Remaining Chapters", es: "Capítulos restantes", ja: "残りチャプター" },
  "analytics.pace.help.remainingChaptersDesc": { en: "How many chapters you still need to study in each section.", es: "Cuántos capítulos te quedan por estudiar en cada sección.", ja: "各セクションで残っている学習チャプター数。" },
  "analytics.pace.help.status": { en: "Status", es: "Estado", ja: "ステータス" },
  "analytics.pace.help.statusDesc": { en: "On Track, Ahead, or Behind relative to your exam date.", es: "On Track (en camino), Ahead (adelantado) o Behind (atrasado) respecto a tu fecha de examen.", ja: "試験日に対して順調、前倒し、遅延のいずれか。" },
  "analytics.pace.help.footer": { en: "Set an exam date in Settings to enable this analysis.", es: "Establece una fecha de examen en Settings para activar este análisis.", ja: "設定で試験日を登録すると利用できます。" },
  "analytics.risk.help.title": { en: "Risk Radar analyzes your study patterns and detects 5 risk types:", es: "Risk Radar analiza tus patrones de estudio y detecta 5 tipos de riesgo:", ja: "学習パターンを分析し、5つのリスクを検出します：" },
  "analytics.risk.help.reviewDebt": { en: "Review Debt", es: "Deuda de repaso", ja: "復習の溜まり" },
  "analytics.risk.help.reviewDebtDesc": { en: "Chapters with retention below 30% that need urgent review.", es: "Capítulos con retención <30% que necesitan revisión urgente.", ja: "定着率30%未満で緊急復習が必要なチャプター。" },
  "analytics.risk.help.cramming": { en: "Cramming Risk", es: "Riesgo de atracón", ja: "詰め込みリスク" },
  "analytics.risk.help.crammingDesc": { en: "Too much new material without enough review sessions.", es: "Demasiado material nuevo sin suficiente repaso.", ja: "復習が追いつかないまま新しい教材を進めすぎている状態。" },
  "analytics.risk.help.stagnation": { en: "Stagnation", es: "Estancamiento", ja: "停滞" },
  "analytics.risk.help.stagnationDesc": { en: "Chapters with no accuracy improvement despite repeated reviews.", es: "Capítulos sin mejora de precisión a pesar de repasos repetidos.", ja: "繰り返し復習しても正答率が改善しないチャプター。" },
  "analytics.risk.help.untouched": { en: "Untouched Chapters", es: "Capítulos sin tocar", ja: "未着手チャプター" },
  "analytics.risk.help.untouchedDesc": { en: "High percentage of chapters not yet studied before exam.", es: "Porcentaje alto de capítulos aún no estudiados.", ja: "試験前にまだ学習していないチャプターの割合が高い。" },
  "analytics.risk.help.variance": { en: "Study Variance", es: "Variación de estudio", ja: "学習のばらつき" },
  "analytics.risk.help.varianceDesc": { en: "Inconsistent weekly study schedule (high hour variation).", es: "Horario de estudio inconsistente semana a semana.", ja: "週ごとの学習時間にばらつきがある状態。" },
  "analytics.risk.help.footer": { en: "Severity levels: Critical (red) → Warning (orange) → Info (blue). Each risk includes a recommended action.", es: "Los niveles van de Critical (rojo) → Warning (naranja) → Info (azul). Cada riesgo incluye una acción recomendada.", ja: "深刻度: 重大（赤）→ 警告（橙）→ 情報（青）。各リスクに対処法が含まれます。" },
  "analytics.retention.help.title": { en: "Compares predicted retention with your actual recall:", es: "Compara la retención predicha con tu recuerdo real:", ja: "予測定着率と実際の想起率を比較：" },
  "analytics.retention.help.predicted": { en: "Predicted", es: "Predicho", ja: "予測値" },
  "analytics.retention.help.actual": { en: "Actual", es: "Real", ja: "実際値" },
  "analytics.retention.help.gap": { en: "Gap", es: "Diferencia", ja: "差分" },
  "analytics.retention.help.action": { en: "Action", es: "Acción", ja: "アクション" },
  "analytics.retention.help.predictedDesc": { en: "Estimated retention based on the forgetting curve algorithm.", es: "Retención estimada por la curva del olvido.", ja: "忘却曲線に基づく推定値。" },
  "analytics.retention.help.actualDesc": { en: "Your actual self-rating when reviewing in the Review tab.", es: "Tu calificación real al repasar en la pestaña Review.", ja: "復習タブでの自己評価の結果。" },
  "analytics.retention.help.gapDesc": { en: "Difference between predicted and actual. Positive = better than expected.", es: "Diferencia entre predicho y real. Positivo = mejor de lo esperado.", ja: "予測と実際の差。プラスなら予想より良い結果。" },
  "analytics.retention.help.actionDesc": { en: "Shorten interval (you remember less), extend (you remember more), or on track.", es: "Acortar intervalo (recuerdas menos), extender (recuerdas más), o en camino.", ja: "記憶が弱い→間隔を短く、強い→間隔を長く、問題なし→順調。" },
  "analytics.retention.help.footer": { en: "Rate your recall in the Review tab to generate this data.", es: "Califica tu recuerdo en la pestaña Review para generar estos datos.", ja: "復習タブで想起度を評価するとデータが生成されます。" },
  "analytics.allocation.help.title": { en: "Recommends how to distribute your study time:", es: "Recomienda cómo distribuir tu tiempo de estudio:", ja: "学習時間の配分をアドバイス：" },
  "analytics.allocation.help.current": { en: "Current", es: "Actual", ja: "現在" },
  "analytics.allocation.help.recommended": { en: "Recommended", es: "Recomendado", ja: "推奨" },
  "analytics.allocation.help.change": { en: "Change", es: "Cambio", ja: "変更" },
  "analytics.allocation.help.currentDesc": { en: "Hours per week you currently spend on each section.", es: "Horas por semana que actualmente dedicas a cada sección.", ja: "各セクションに現在費やしている週間学習時間。" },
  "analytics.allocation.help.recommendedDesc": { en: "Suggested hours based on your progress and retention.", es: "Horas sugeridas basadas en tu progreso y retención.", ja: "進捗と定着率に基づくおすすめの学習時間。" },
  "analytics.allocation.help.changeDesc": { en: "Increase = spend more time, Decrease = reduce, Maintain = keep same.", es: "Increase = dedicar más tiempo, Decrease = reducir, Maintain = mantener.", ja: "増加→時間を増やす、減少→減らす、維持→現状維持。" },
  "analytics.allocation.help.footer": { en: "Recommendations are based on overdue reviews, coverage gaps, and goal pace.", es: "Las recomendaciones se basan en repasos pendientes, cobertura y ritmo del objetivo.", ja: "復習の遅れ、未対策チャプター、目標ペースに基づいて算出しています。" },
  "analytics.coverage.help.title": { en: "Identifies chapters that need attention:", es: "Identifica capítulos que necesitan atención:", ja: "対策が必要なチャプターを特定：" },
  "analytics.coverage.help.fragileDesc": { en: "Chapters studied but with very low retention (<30%). Need urgent review.", es: "Capítulos estudiados pero con retención muy baja (<30%). Necesitan repaso urgente.", ja: "学習済みだが定着度が非常に低い（30%未満）。緊急の復習が必要。" },
  "analytics.coverage.help.untouchedDesc": { en: "Chapters you haven't studied yet. Those marked 'Urgent' have an upcoming exam.", es: "Capítulos que aún no has estudiado. Los marcados como 'Urgent' tienen examen próximo.", ja: "まだ学習していないチャプター。「Urgent」は試験が近いもの。" },
  "analytics.coverage.help.footer": { en: "Organized by section. Use this to prioritize your study plan.", es: "Organizado por sección. Usa esta información para priorizar tu estudio.", ja: "セクション別に整理。学習の優先順位を決めるのに活用してください。" },
  "analytics.coverage.desc": { en: "Shows chapters you haven't started yet or whose retention has dropped below 30%. Chapters marked \"Urgent\" have an exam within 60 days.", es: "Muestra capítulos que aún no has empezado o cuya retención ha caído por debajo del 30%. Los capítulos marcados \"Urgent\" tienen un examen dentro de 60 días.", ja: "未着手または定着度が30%以下に低下したチャプターを表示。「Urgent」は試験まで60日以内のチャプター。" },

  // ── Week days ───────────────────────────────────────────────────
  "day.sun": { en: "Sun", es: "Dom", ja: "日" },
  "day.mon": { en: "Mon", es: "Lun", ja: "月" },
  "day.tue": { en: "Tue", es: "Mar", ja: "火" },
  "day.wed": { en: "Wed", es: "Mié", ja: "水" },
  "day.thu": { en: "Thu", es: "Jue", ja: "木" },
  "day.fri": { en: "Fri", es: "Vie", ja: "金" },
  "day.sat": { en: "Sat", es: "Sáb", ja: "土" },

  // ── Onboarding Tour ──────────────────────────────────────────
  "tour.step1.title": { en: "Welcome to CPA Mastery!", es: "¡Bienvenido a CPA Mastery!", ja: "CPA Masteryへようこそ！" },
  "tour.step1.desc": { en: "This is your Dashboard — your central hub. Here you can see study hours, streak, exam section progress, and review queue at a glance. Let's walk through each page.", es: "Este es tu Panel — tu centro de control. Aquí puedes ver horas de estudio, racha, progreso por sección y cola de repaso de un vistazo. Veamos cada página.", ja: "ここがダッシュボード — あなたの学習の中心です。学習時間、連続記録、セクション別の進捗、要復習リストを一目で確認できます。各ページを見ていきましょう。" },
  "tour.step2.title": { en: "Track Your Progress", es: "Sigue tu progreso", ja: "進捗を確認" },
  "tour.step2.desc": { en: "These cards show your total study hours across all sections and your daily streak. Study consistently every day to build your streak — even 30 minutes counts!", es: "Estas tarjetas muestran tus horas totales y tu racha diaria. Estudia cada día para mantener tu racha — ¡incluso 30 minutos cuenta!", ja: "これらのカードは全セクションの合計学習時間と連続学習日数を表示します。毎日学習して連続記録を伸ばしましょう — 30分でもOK！" },
  "tour.step3.title": { en: "Chapters — Your Study Hub", es: "Capítulos — Tu centro de estudio", ja: "チャプター — 学習の中心" },
  "tour.step3.desc": { en: "All chapters organized by exam section (FAR, AUD, REG, etc.). Tap any chapter to open its detail page where you can:\n• Record study sessions (hours, MC/TBS questions)\n• Save key insights with AI-powered Essence Notes\n• Track accuracy and study time per chapter", es: "Todos los capítulos organizados por sección (FAR, AUD, REG, etc.). Toca cualquier capítulo para:\n• Registrar sesiones de estudio (horas, preguntas MC/TBS)\n• Guardar ideas clave con Notas Esenciales con IA\n• Rastrear precisión y tiempo por capítulo", ja: "試験セクション別（FAR、AUD、REGなど）に整理された全チャプター。チャプターをタップして詳細ページを開くと：\n• 学習セッションの記録（時間、MC/TBS問題数）\n• AI搭載のエッセンスノートで重要ポイントを保存\n• チャプター別の正答率と学習時間を追跡" },
  "tour.step4.title": { en: "Study Log — Record Every Session", es: "Registro — Registra cada sesión", ja: "学習記録 — すべてのセッションを記録" },
  "tour.step4.desc": { en: "Your complete study history. Each entry tracks date, hours, MC/TBS questions, and accuracy.\n• Click \"New Entry\" to add a session\n• Weekly Summary shows study patterns and trends\n• Charts visualize your study hours by section", es: "Tu historial completo de estudio. Cada entrada registra fecha, horas, preguntas MC/TBS y precisión.\n• Haz clic en \"Nueva entrada\" para agregar una sesión\n• El Resumen Semanal muestra patrones y tendencias\n• Los gráficos visualizan tus horas por sección", ja: "完全な学習履歴。各エントリーは日付、時間、MC/TBS問題数、正答率を記録。\n• 「新規記録」をクリックしてセッションを追加\n• 週間サマリーで学習パターンとトレンドを確認\n• チャートでセクション別の学習時間を可視化" },
  "tour.step5.title": { en: "Practice Exam — Simulate Test Day", es: "Examen de práctica — Simula el día del examen", ja: "模擬試験 — 本番をシミュレーション" },
  "tour.step5.desc": { en: "Log your mock exam scores by section, tracking MC and TBS results separately.\n• Click \"Add Result\" to record a practice exam\n• Score trend chart shows improvement over time\n• Aim for 75+ on practice exams to be exam-ready!", es: "Registra tus puntuaciones por sección, con resultados MC y TBS separados.\n• Haz clic en \"Agregar resultado\" para registrar un examen\n• El gráfico de tendencia muestra tu mejora\n• ¡Apunta a 75+ en exámenes de práctica!", ja: "セクション別の模擬試験スコアをMCとTBSに分けて記録。\n• 「結果を追加」をクリックして模擬試験を記録\n• スコア推移チャートで改善を確認\n• 模擬試験で75以上を目指しましょう！" },
  "tour.step6.title": { en: "Review — Beat the Forgetting Curve", es: "Repaso — Vence la curva del olvido", ja: "復習 — 忘却曲線に打ち勝つ" },
  "tour.step6.desc": { en: "Powered by spaced repetition (Ebbinghaus forgetting curve). Chapters are ranked by memory retention.\n• Red = Overdue — review immediately!\n• Yellow = Due Today — scheduled review time\n• Green = Well Retained — no rush\nTap any chapter to see its forgetting curve and rate your recall.", es: "Basado en la repetición espaciada (curva de Ebbinghaus). Los capítulos se ordenan por retención.\n• Rojo = Vencido — ¡repasa ahora!\n• Amarillo = Para hoy — momento de repaso\n• Verde = Bien retenido — sin prisa\nToca cualquier capítulo para ver su curva y calificar tu recuerdo.", ja: "間隔反復学習（エビングハウスの忘却曲線）に基づくシステム。チャプターは定着率順に表示。\n• 赤 = 期限超過 — すぐに復習！\n• 黄 = 本日期限 — 復習のタイミング\n• 緑 = 定着良好 — 急ぎません\nチャプターをタップして忘却曲線を確認し、記憶度を評価。" },
  "tour.step7.title": { en: "Analytics — Strategic Insights", es: "Analíticas — Información estratégica", ja: "分析 — 学習戦略" },
  "tour.step7.desc": { en: "Data-driven guidance for smarter studying:\n• Goal Pace — Are you on track for your exam date?\n• Risk Radar — Detects cramming, review debt, stagnation\n• Retention Calibration — Predicted vs actual recall\n• Coverage Gaps — Untouched or fragile chapters\nSet exam dates in Settings to unlock full analysis.", es: "Orientación basada en datos:\n• Ritmo del objetivo — ¿Estás al día para tu examen?\n• Radar de riesgos — Detecta atracón, deuda de repaso\n• Calibración — Recuerdo predicho vs real\n• Brechas — Capítulos sin tocar o frágiles\nEstablece fechas de examen en Ajustes.", ja: "データに基づく効率的な学習ガイダンス：\n• 目標ペース — 試験日に間に合うペースですか？\n• リスク分析 — 詰め込み、復習の遅れ、停滞を検出\n• 記憶の定着度 — 予測と実際の想起率を比較\n• 未対策チャプター — 未着手・定着不足のチャプター\n設定で試験日を登録すると完全な分析が利用できます。" },
  "tour.step8.title": { en: "Settings — Set Your Goals", es: "Ajustes — Configura tus metas", ja: "設定 — 目標を設定" },
  "tour.step8.desc": { en: "Configure your study experience:\n• Set exam dates and target scores per section\n• Adjust daily study goals\n• Manage notification preferences (review alerts, streak protection)\n• Your exam dates power the Goal Pace analysis in Analytics", es: "Configura tu experiencia de estudio:\n• Establece fechas de examen y metas por sección\n• Ajusta metas diarias de estudio\n• Gestiona notificaciones (alertas de repaso, racha)\n• Tus fechas de examen alimentan el análisis de ritmo", ja: "学習体験をカスタマイズ：\n• セクション別の試験日と目標スコアを設定\n• 毎日の学習目標を調整\n• 通知設定を管理（復習アラート、連続記録の保護）\n• 試験日の設定が分析の目標ペース機能に反映" },
  "tour.step9.title": { en: "You're All Set!", es: "¡Todo listo!", ja: "準備完了！" },
  "tour.step9.desc": { en: "Start by heading to Chapters and recording your first study session. As you add data, your dashboard, review schedule, and analytics will come alive. You can restart this tour anytime from the \"How to use\" guide on the Dashboard. Good luck!", es: "Comienza yendo a Capítulos y registrando tu primera sesión. A medida que agregues datos, tu panel, repaso y analíticas cobrarán vida. Puedes reiniciar este recorrido desde la guía \"Cómo usar\" en el Panel. ¡Buena suerte!", ja: "まずチャプターに移動して最初の学習セッションを記録しましょう。データを追加していくと、ダッシュボード、復習スケジュール、分析が充実していきます。このツアーはダッシュボードの「使い方」ガイドからいつでも再開できます。頑張ってください！" },
  "tour.next": { en: "Next", es: "Siguiente", ja: "次へ" },
  "tour.skip": { en: "Skip", es: "Omitir", ja: "スキップ" },
  "tour.finish": { en: "Got it!", es: "¡Entendido!", ja: "了解！" },
  "tour.stepOf": { en: "of", es: "de", ja: "/" },

  // ─── Usage Badge ───
  "usage.remaining": { en: "remaining", es: "restantes", ja: "残り" },

  // ─── Paywall Dialog ───
  "paywall.limitTitle": { en: "You've reached the limit", es: "Has alcanzado el límite", ja: "上限に達しました" },
  "paywall.limitDesc": { en: "Upgrade to Pro for 60 Essence Notes per month with premium AI models.", es: "Actualiza a Pro para 60 Essence Notes al mes con modelos de IA premium.", ja: "Proにアップグレードすると、月60回のEssence Notesと高性能AIモデルが使えます。" },
  "paywall.planTitle": { en: "AI Study Plan", es: "Plan de Estudio IA", ja: "AI学習プラン" },
  "paywall.planDesc": { en: "Get a personalized AI-powered study plan to optimize your exam preparation.", es: "Obtén un plan de estudio personalizado con IA para optimizar tu preparación.", ja: "AIがあなた専用の学習プランを作成し、試験対策を最適化します。" },
  "paywall.benefit1Title": { en: "60 Essence Notes/month", es: "60 Essence Notes/mes", ja: "月60回のEssence Notes" },
  "paywall.benefit1Desc": { en: "6x more AI-powered study note analyses", es: "6x más análisis de notas con IA", ja: "Freeプランの6倍のAI分析回数" },
  "paywall.benefit2Title": { en: "Premium AI models", es: "Modelos de IA premium", ja: "高性能AIモデル" },
  "paywall.benefit2Desc": { en: "Claude Sonnet, Gemini 2.5 Flash for deeper insights", es: "Claude Sonnet, Gemini 2.5 Flash para análisis más profundos", ja: "Claude Sonnet、Gemini 2.5 Flashでより深い分析" },
  "paywall.benefit3Title": { en: "AI Study Plan (coming soon)", es: "Plan de Estudio IA (próximamente)", ja: "AI学習プラン（近日公開）" },
  "paywall.benefit3Desc": { en: "Personalized study schedule optimized for your exam date", es: "Horario personalizado optimizado para tu fecha de examen", ja: "試験日に合わせた最適な学習スケジュール" },
  "paywall.cta": { en: "Upgrade to Pro", es: "Actualizar a Pro", ja: "Proにアップグレード" },
  "paywall.price": { en: "¥980/month — Cancel anytime", es: "¥980/mes — Cancela cuando quieras", ja: "月額980円 — いつでも解約可能" },

  // ─── Pricing Page ───
  "pricing.perMonth": { en: "month", es: "mes", ja: "月" },
  "pricing.freeDesc": { en: "Get started with essential study tools", es: "Comienza con herramientas esenciales", ja: "基本的な学習ツールで始める" },
  "pricing.proDesc": { en: "Maximize your pass rate with premium AI", es: "Maximiza tu aprobación con IA premium", ja: "高性能AIで合格率を最大化" },
  "pricing.freeFeature1": { en: "10 Essence Notes/month", es: "10 Essence Notes/mes", ja: "月10回のEssence Notes" },
  "pricing.freeFeature2": { en: "Progress tracking & analytics", es: "Seguimiento y analíticas", ja: "進捗管理・分析機能" },
  "pricing.freeFeature3": { en: "Spaced repetition review", es: "Repaso con repetición espaciada", ja: "間隔反復の復習機能" },
  "pricing.freeFeature4": { en: "Premium AI models", es: "Modelos de IA premium", ja: "高性能AIモデル" },
  "pricing.freeFeature5": { en: "AI Study Plan", es: "Plan de Estudio IA", ja: "AI学習プラン" },
  "pricing.proFeature1": { en: "60 Essence Notes/month", es: "60 Essence Notes/mes", ja: "月60回のEssence Notes" },
  "pricing.proFeature2": { en: "Progress tracking & analytics", es: "Seguimiento y analíticas", ja: "進捗管理・分析機能" },
  "pricing.proFeature3": { en: "Spaced repetition review", es: "Repaso con repetición espaciada", ja: "間隔反復の復習機能" },
  "pricing.proFeature4": { en: "Premium AI models (Claude, Gemini 2.5)", es: "Modelos premium (Claude, Gemini 2.5)", ja: "高性能AIモデル (Claude, Gemini 2.5)" },
  "pricing.proFeature5": { en: "AI Study Plan (coming soon)", es: "Plan IA (próximamente)", ja: "AI学習プラン（近日公開）" },
  "pricing.freeCta": { en: "Get Started Free", es: "Empezar Gratis", ja: "無料で始める" },
  "pricing.proCta": { en: "Upgrade to Pro", es: "Actualizar a Pro", ja: "Proにアップグレード" },
  "pricing.popular": { en: "Most Popular", es: "Más Popular", ja: "人気No.1" },
  "pricing.heroTitle": { en: "Simple, transparent pricing", es: "Precios simples y transparentes", ja: "シンプルで透明な料金体系" },
  "pricing.heroSubtitle": { en: "Start free, upgrade when you need more AI power for your USCPA preparation.", es: "Comienza gratis, actualiza cuando necesites más IA.", ja: "まず無料で始めて、より強力なAIが必要になったらアップグレード。" },
  "pricing.cancelAnytime": { en: "All plans include a 30-day money-back guarantee. Cancel anytime, no questions asked.", es: "Todos los planes incluyen garantía de 30 días. Cancela cuando quieras.", ja: "全プラン30日間の返金保証付き。いつでも解約可能、理由は不要です。" },
  "pricing.backToApp": { en: "Back to app", es: "Volver a la app", ja: "アプリに戻る" },
  "pricing.login": { en: "Log in", es: "Iniciar sesión", ja: "ログイン" },
  "pricing.signUpFirst": { en: "Sign up to subscribe", es: "Regístrate para suscribirte", ja: "登録してサブスク開始" },

  // ─── Landing Page ───
  "lp.features": { en: "Features", es: "Funciones", ja: "機能" },
  "lp.pricing": { en: "Pricing", es: "Precios", ja: "料金" },
  "lp.login": { en: "Log in", es: "Iniciar sesión", ja: "ログイン" },
  "lp.signUp": { en: "Sign Up Free", es: "Registrarse Gratis", ja: "無料登録" },
  "lp.badge": { en: "AI-Powered USCPA Study Platform", es: "Plataforma de Estudio USCPA con IA", ja: "AI搭載USCPA学習プラットフォーム" },
  "lp.heroTitle": { en: "Pass the USCPA Exam with AI-Powered Study Tools", es: "Aprueba el Examen USCPA con Herramientas de IA", ja: "AI学習ツールでUSCPA試験に合格しよう" },
  "lp.heroSubtitle": { en: "Transform your study materials into exam-winning insights. Track progress, master concepts with spaced repetition, and study smarter — not harder.", es: "Transforma tus materiales en conocimientos ganadores. Sigue tu progreso, domina conceptos con repetición espaciada.", ja: "教材をAIが分析して合格に直結するインサイトを抽出。進捗管理、間隔反復、効率的な学習を実現します。" },
  "lp.getStarted": { en: "Get Started Free", es: "Empezar Gratis", ja: "無料で始める" },
  "lp.viewPricing": { en: "View Pricing", es: "Ver Precios", ja: "料金を見る" },
  "lp.featuresTitle": { en: "Everything you need to pass", es: "Todo lo que necesitas para aprobar", ja: "合格に必要なすべて" },
  "lp.featuresSubtitle": { en: "Designed specifically for USCPA candidates who want to study efficiently.", es: "Diseñado para candidatos USCPA que quieren estudiar eficientemente.", ja: "効率的に学習したいUSCPA受験生のために設計。" },
  "lp.feature1Title": { en: "Essence Notes", es: "Essence Notes", ja: "Essence Notes" },
  "lp.feature1Desc": { en: "Upload study screenshots or paste text — AI extracts key concepts, exam traps, and memory rules.", es: "Sube capturas o pega texto — la IA extrae conceptos clave y reglas.", ja: "教材のスクショやテキストをAIが分析し、重要概念・試験の罠・暗記ルールを抽出。" },
  "lp.feature2Title": { en: "Smart Analytics", es: "Analíticas Inteligentes", ja: "スマート分析" },
  "lp.feature2Desc": { en: "Track study hours, accuracy rates, and section-by-section progress toward your target score.", es: "Sigue horas de estudio, tasas de acierto y progreso por sección.", ja: "学習時間、正答率、セクション別進捗を目標スコアに向けてトラッキング。" },
  "lp.feature3Title": { en: "Spaced Repetition", es: "Repetición Espaciada", ja: "間隔反復" },
  "lp.feature3Desc": { en: "Science-backed review scheduling based on the forgetting curve to maximize long-term retention.", es: "Repaso basado en la curva del olvido para maximizar la retención.", ja: "忘却曲線に基づく科学的な復習スケジュールで長期記憶を最大化。" },
  "lp.feature4Title": { en: "All 6 Sections", es: "Las 6 Secciones", ja: "全6セクション対応" },
  "lp.feature4Desc": { en: "Full coverage of FAR, AUD, REG, BEC, TCP, and ISC with chapter-level tracking.", es: "Cobertura completa de FAR, AUD, REG, BEC, TCP e ISC.", ja: "FAR、AUD、REG、BEC、TCP、ISCの全セクションをチャプター単位で管理。" },
  "lp.whyTitle": { en: "Built for serious CPA candidates", es: "Hecho para candidatos CPA serios", ja: "本気のCPA受験生のために" },
  "lp.why1": { en: "AI extracts exam-specific insights that generic study tools miss", es: "La IA extrae conocimientos específicos del examen", ja: "AIが汎用ツールでは見逃す試験特化のインサイトを抽出" },
  "lp.why2": { en: "Spaced repetition proven to improve long-term retention by 200%+", es: "Repetición espaciada mejora retención a largo plazo en 200%+", ja: "間隔反復は長期記憶を200%以上向上させることが実証済み" },
  "lp.why3": { en: "Track every section independently — know exactly where to focus", es: "Sigue cada sección — sabe exactamente dónde enfocarte", ja: "セクション別の独立管理で注力すべき箇所が一目瞭然" },
  "lp.ctaTitle": { en: "Start studying smarter today", es: "Empieza a estudiar mejor hoy", ja: "今日からスマートに学習を始めよう" },
  "lp.ctaSubtitle": { en: "Join CPA candidates who are using AI to prepare more efficiently.", es: "Únete a candidatos que usan IA para prepararse mejor.", ja: "AIを活用して効率的に試験対策しているCPA受験生に加わろう。" },
  "lp.ctaButton": { en: "Create Free Account", es: "Crear Cuenta Gratis", ja: "無料アカウントを作成" },
  "lp.terms": { en: "Terms", es: "Términos", ja: "利用規約" },
  "lp.privacy": { en: "Privacy", es: "Privacidad", ja: "プライバシー" },

  // ─── Settings Subscription ───
  "settings.subscription": { en: "Subscription", es: "Suscripción", ja: "サブスクリプション" },
  "settings.currentPlan": { en: "Current plan", es: "Plan actual", ja: "現在のプラン" },
  "settings.usageThisMonth": { en: "This month", es: "Este mes", ja: "今月の使用量" },
  "settings.manageSub": { en: "Manage", es: "Gestionar", ja: "管理" },
  "settings.upgrade": { en: "Upgrade", es: "Actualizar", ja: "アップグレード" },

  // ─── Legal ───
  "legal.backHome": { en: "Back", es: "Volver", ja: "戻る" },
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
    if (saved === "en" || saved === "es" || saved === "ja") {
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
