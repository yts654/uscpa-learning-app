export interface PasswordRequirement {
  label: string
  met: boolean
}

export interface PasswordValidationResult {
  requirements: PasswordRequirement[]
  score: number // 0-100
}

export function validatePassword(password: string): PasswordValidationResult {
  const requirements: PasswordRequirement[] = [
    { label: "8 characters or more", met: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    { label: "Special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ]

  const metCount = requirements.filter((r) => r.met).length
  const score = Math.round((metCount / requirements.length) * 100)

  return { requirements, score }
}

export function getPasswordStrengthLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: "Very Weak", color: "rgb(239, 68, 68)" }    // red
  if (score <= 40) return { label: "Weak", color: "rgb(249, 115, 22)" }        // orange
  if (score <= 60) return { label: "Fair", color: "rgb(234, 179, 8)" }         // yellow
  if (score <= 80) return { label: "Strong", color: "rgb(59, 130, 246)" }      // blue
  return { label: "Very Strong", color: "rgb(34, 197, 94)" }                   // green
}

export function getPasswordValidationError(password: string): string | null {
  const { requirements } = validatePassword(password)
  const unmet = requirements.filter((r) => !r.met)
  if (unmet.length === 0) return null
  return `Password must contain: ${unmet.map((r) => r.label.toLowerCase()).join(", ")}`
}
