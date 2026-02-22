export type Plan = "free" | "pro"

export const VISION_MODELS: Record<Plan, string[]> = {
  free: [
    "google/gemini-2.0-flash-001",
  ],
  pro: [
    "google/gemini-2.5-flash-preview",
    "google/gemini-2.0-flash-001",
    "anthropic/claude-sonnet-4-20250514",
  ],
}

export const ANALYSIS_MODELS: Record<Plan, string[]> = {
  free: [
    "google/gemini-2.0-flash-001",
    "deepseek/deepseek-chat-v3-0324",
  ],
  pro: [
    "anthropic/claude-sonnet-4-20250514",
    "google/gemini-2.5-flash-preview",
    "google/gemini-2.0-flash-001",
  ],
}

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 10,
  pro: 60,
}
