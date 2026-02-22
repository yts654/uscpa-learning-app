"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { User, Bell, Target, Calendar, Camera, CheckCircle2, Sun, Moon, Lock, AlertTriangle } from "lucide-react"
import { SECTION_INFO, type ExamSection, type StudyGoals } from "@/lib/study-data"
import { useLanguage, type Locale } from "@/lib/i18n"
import { getNotifPrefs, setNotifPrefs, ensureNotificationPermission, type NotificationPrefs } from "@/lib/notifications"

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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notifPrefs, setNotifPrefsState] = useState<NotificationPrefs>(getNotifPrefs)
  const [notifBlocked, setNotifBlocked] = useState(false)

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "denied") {
      setNotifBlocked(true)
    }
  }, [])

  const handleNotifToggle = async (key: keyof NotificationPrefs, checked: boolean) => {
    if (checked) {
      const granted = await ensureNotificationPermission()
      if (!granted) {
        if (typeof Notification !== "undefined" && Notification.permission === "denied") {
          setNotifBlocked(true)
        }
        return
      }
      setNotifBlocked(false)
    }
    const updated = { ...notifPrefs, [key]: checked }
    setNotifPrefsState(updated)
    setNotifPrefs(updated)
  }

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

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: t("settings.passwordMinLength") })
      return
    }
    setPasswordLoading(true)
    setPasswordMsg(null)
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        setPasswordMsg({ type: "success", text: t("settings.passwordChanged") })
        setCurrentPassword("")
        setNewPassword("")
      } else {
        const data = await res.json()
        setPasswordMsg({ type: "error", text: data.error || t("settings.passwordError") })
      }
    } catch {
      setPasswordMsg({ type: "error", text: t("settings.passwordError") })
    }
    setPasswordLoading(false)
  }

  const updateSectionDate = (section: ExamSection, value: string) => {
    onUpdateStudyGoals({
      ...studyGoals,
      sections: {
        ...studyGoals.sections,
        [section]: { ...studyGoals.sections[section], examDate: value || null },
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

      {/* Change Password */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("settings.changePassword")}</h3>
        </div>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.currentPassword")}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.newPassword")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("settings.passwordMinLengthHint")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {passwordMsg && (
            <div className={`text-xs px-3 py-2 rounded-lg ${passwordMsg.type === "success" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20" : "text-red-400 bg-red-400/10"}`}>
              {passwordMsg.text}
            </div>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={passwordLoading || !currentPassword || !newPassword}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {passwordLoading ? "..." : t("settings.updatePassword")}
          </button>
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
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "light", labelKey: "settings.light" as const, icon: Sun },
              { value: "dark", labelKey: "settings.dark" as const, icon: Moon },
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
              { value: "en" as Locale, label: "English", flag: "🇺🇸" },
              { value: "es" as Locale, label: "Español", flag: "🇪🇸" },
            ]).map((opt) => {
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
                  <span className="text-base font-bold">{opt.flag}</span>
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

        {(["FAR", "AUD", "REG", "BEC", "TCP", "ISC"] as ExamSection[]).map((section) => {
          const info = SECTION_INFO[section]
          const isCompleted = completedSections.includes(section)
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
                  <input
                    type="date"
                    value={studyGoals.sections[section].examDate || ""}
                    onChange={(e) => updateSectionDate(section, e.target.value)}
                    disabled={isCompleted}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.weekdayGoal")}</label>
              <select
                value={studyGoals.dailyStudyHours}
                onChange={(e) => onUpdateStudyGoals({ ...studyGoals, dailyStudyHours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5).map(v => (
                  <option key={v} value={v}>{v} {v === 1 ? t("settings.hour") : t("settings.hours")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground block mb-1.5">{t("settings.weekendGoal")}</label>
              <select
                value={studyGoals.weekendStudyHours ?? studyGoals.dailyStudyHours}
                onChange={(e) => onUpdateStudyGoals({ ...studyGoals, weekendStudyHours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5).map(v => (
                  <option key={v} value={v}>{v} {v === 1 ? t("settings.hour") : t("settings.hours")}</option>
                ))}
              </select>
            </div>
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
        {notifBlocked && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{t("settings.notifBlocked")}</span>
          </div>
        )}
        <div className="space-y-3">
          {([
            { prefKey: "review" as const, labelKey: "settings.reviewAlerts" as const },
            { prefKey: "weekly" as const, labelKey: "settings.weeklyReport" as const },
            { prefKey: "streak" as const, labelKey: "settings.streakNotifications" as const },
            { prefKey: "milestone" as const, labelKey: "settings.milestoneNotifications" as const },
          ]).map((item) => (
            <label key={item.prefKey} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm text-card-foreground">{t(item.labelKey)}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={notifPrefs[item.prefKey]}
                  onChange={(e) => handleNotifToggle(item.prefKey, e.target.checked)}
                  className="sr-only peer"
                />
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
