"use client"

import { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { User, Bell, Target, Calendar, Camera, CheckCircle2, Sun, Moon, Monitor, Languages } from "lucide-react"
import { SECTION_INFO, type ExamSection, type StudyGoals } from "@/lib/study-data"
import { useLanguage, type Locale } from "@/lib/i18n"

interface UserProfile {
  name: string
  email: string
  photoUrl: string | null
}

interface SettingsViewProps {
  profile: UserProfile
  onUpdateProfile: (profile: UserProfile) => void
  completedSections: ExamSection[]
  onUpdateCompletedSections: (sections: ExamSection[]) => void
  studyGoals: StudyGoals
  onUpdateStudyGoals: (goals: StudyGoals) => void
}

export function SettingsView({ profile, onUpdateProfile, completedSections, onUpdateCompletedSections, studyGoals, onUpdateStudyGoals }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLanguage()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.photoUrl)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPhotoUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = () => {
    onUpdateProfile({ name, email, photoUrl })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Helper to parse/update exam date parts from studyGoals
  const getDateParts = (section: ExamSection) => {
    const examDate = studyGoals.sections[section].examDate
    if (!examDate) return { year: "", month: "", day: "" }
    const [y, m, d] = examDate.split("-")
    return { year: y, month: String(parseInt(m)), day: String(parseInt(d)) }
  }

  const updateSectionDate = (section: ExamSection, part: "year" | "month" | "day", value: string) => {
    const parts = getDateParts(section)
    parts[part] = value

    let examDate: string | null = null
    if (parts.year && parts.month && parts.day) {
      examDate = `${parts.year}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`
    }

    onUpdateStudyGoals({
      ...studyGoals,
      sections: {
        ...studyGoals.sections,
        [section]: { ...studyGoals.sections[section], examDate },
      },
    })
  }

  const updateTargetScore = (section: ExamSection, score: number) => {
    onUpdateStudyGoals({
      ...studyGoals,
      sections: {
        ...studyGoals.sections,
        [section]: { ...studyGoals.sections[section], targetScore: score },
      },
    })
  }

  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-foreground">{t("settings.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("settings.profile")}</h3>
        </div>

        {/* Photo + Name/Email layout */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative group">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{initials || "?"}</span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            {photoUrl && (
              <button
                onClick={handleRemovePhoto}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                {t("settings.removePhoto")}
              </button>
            )}
          </div>

          {/* Name & Email fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.fullName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.fullNamePlaceholder")}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("settings.emailPlaceholder")}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <Sun className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("settings.appearance")}</h3>
        </div>
        <div>
          <label className="text-sm font-medium text-card-foreground block mb-3">{t("settings.theme")}</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: "light", labelKey: "settings.light" as const, icon: Sun },
              { value: "dark", labelKey: "settings.dark" as const, icon: Moon },
              { value: "system", labelKey: "settings.system" as const, icon: Monitor },
            ] as const).map((opt) => {
              const Icon = opt.icon
              const isActive = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(opt.labelKey)}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-6">
          <label className="text-sm font-medium text-card-foreground block mb-3">{t("settings.language")}</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "en" as Locale, label: "English", icon: Languages },
              { value: "es" as Locale, label: "Español", icon: Languages },
            ]).map((opt) => {
              const Icon = opt.icon
              const isActive = locale === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setLocale(opt.value)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Exam Target - per section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("settings.examTarget")}</h3>
        </div>

        {(["FAR", "AUD", "REG", "BEC", "TCP"] as ExamSection[]).map((section) => {
          const info = SECTION_INFO[section]
          const isCompleted = completedSections.includes(section)
          const dateParts = getDateParts(section)
          const toggleCompleted = () => {
            if (isCompleted) {
              onUpdateCompletedSections(completedSections.filter(s => s !== section))
            } else {
              onUpdateCompletedSections([...completedSections, section])
            }
          }
          return (
            <div key={section} className={`px-6 py-4 border-b border-border last:border-b-0 transition-all ${isCompleted ? "opacity-50 bg-muted/30" : ""}`}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold text-[hsl(0,0%,100%)]"
                  style={{ backgroundColor: isCompleted ? "hsl(0 0% 60%)" : info.color }}
                >
                  {section}
                </div>
                <span className={`text-sm font-semibold ${isCompleted ? "text-muted-foreground line-through" : "text-card-foreground"}`}>{info.fullName}</span>
                <button
                  onClick={toggleCompleted}
                  className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    isCompleted
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCompleted ? t("settings.completed") : t("settings.markComplete")}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">{t("settings.examDate")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={dateParts.year}
                      onChange={(e) => updateSectionDate(section, "year", e.target.value)}
                      disabled={isCompleted}
                      className="w-full px-2 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{locale === "es" ? "Año" : "Year"}</option>
                      {Array.from({ length: 7 }, (_, i) => 2025 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <select
                      value={dateParts.month}
                      onChange={(e) => updateSectionDate(section, "month", e.target.value)}
                      disabled={isCompleted}
                      className="w-full px-2 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{locale === "es" ? "Mes" : "Mon"}</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>
                          {locale === "es"
                            ? new Date(2025, m - 1).toLocaleString("es", { month: "short" })
                            : new Date(2025, m - 1).toLocaleString("en", { month: "short" })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={dateParts.day}
                      onChange={(e) => updateSectionDate(section, "day", e.target.value)}
                      disabled={isCompleted}
                      className="w-full px-2 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{locale === "es" ? "Día" : "Day"}</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">{t("settings.targetScore")}</label>
                  <select
                    value={studyGoals.sections[section].targetScore}
                    onChange={(e) => updateTargetScore(section, parseInt(e.target.value))}
                    disabled={isCompleted}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="75">75 ({t("settings.passing")})</option>
                    <option value="80">80</option>
                    <option value="85">85</option>
                    <option value="90">90+</option>
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Study Preferences */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("settings.studyPreferences")}</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.dailyGoal")}</label>
            <select
              value={studyGoals.dailyStudyHours}
              onChange={(e) => onUpdateStudyGoals({ ...studyGoals, dailyStudyHours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="1">1 {t("settings.hour")}</option>
              <option value="2">2 {t("settings.hours")}</option>
              <option value="3">3 {t("settings.hours")}</option>
              <option value="4">4 {t("settings.hours")}</option>
              <option value="5">5+ {t("settings.hours")}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.questionsPerSession")}</label>
            <select
              value={studyGoals.questionsPerSession}
              onChange={(e) => onUpdateStudyGoals({ ...studyGoals, questionsPerSession: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="10">10 {t("settings.questionsUnit")}</option>
              <option value="25">25 {t("settings.questionsUnit")}</option>
              <option value="50">50 {t("settings.questionsUnit")}</option>
              <option value="100">100 {t("settings.questionsUnit")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("settings.notifications")}</h3>
        </div>
        <div className="space-y-3">
          {([
            { key: "settings.dailyReminder" as const },
            { key: "settings.weeklyReport" as const },
            { key: "settings.streakNotifications" as const },
          ]).map((item) => (
            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm text-card-foreground">{t(item.key)}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform peer-checked:translate-x-4" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {saved ? t("settings.saved") : t("settings.saveChanges")}
      </button>
    </div>
  )
}
