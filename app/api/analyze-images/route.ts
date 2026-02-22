import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { VISION_MODELS, ANALYSIS_MODELS, PLAN_LIMITS } from "@/lib/ai-models"
import { getUsage, incrementUsage, checkRateLimit } from "@/lib/usage"
import type { Plan } from "@/lib/ai-models"

// Allow long-running analysis (Hobby plan max: 60s)
export const maxDuration = 60

const OCR_PROMPT = `You are an expert OCR assistant specializing in USCPA (US CPA exam) study materials.
Extract ALL text content from the provided screenshot(s) with perfect accuracy.

Rules:
- Preserve the original structure: headings, bullet points, numbered lists, tables, formulas
- Include ALL text visible in the image(s) — miss nothing
- For multiple choice questions: clearly mark Question, each option (A, B, C, D), and explanation
- For textbook pages: preserve section headers, paragraph structure, and any diagrams described in text
- For TBS (Task-Based Simulations): preserve the scenario, exhibits, and required fields
- Preserve any numbers, percentages, dollar amounts, and dates exactly as shown
- Output in the original language (English or Japanese)
- If multiple images, separate each with "---"
- Do NOT add commentary — extract text faithfully`

const ANALYSIS_PROMPT = `You are a top-tier USCPA exam tutor who has helped thousands of candidates pass all 4 sections.
Your specialty: distilling complex accounting content into exam-winning insights.

## Task
Analyze the following USCPA study content and extract 3-5 high-quality insights that directly help pass the exam.

## The 4 Insight Types

### concept (Core Concept)
Explain the "WHY" behind an accounting treatment — not just what to do, but why it works that way.
Example: "Revenue recognition under ASC 606 follows a 5-step model because it separates the PROMISE (performance obligation) from the PAYMENT (transaction price). Think: What did we promise? → When did we deliver? → How much do we get?"

### framework (Decision Framework)
Give a step-by-step decision tree for solving exam questions. Must be actionable.
Example: "Inventory write-down decision: (1) Compare cost vs. NRV → (2) If NRV < cost, write down to NRV → (3) Under GAAP: NO reversal allowed → (4) Under IFRS: reversal allowed up to original cost. Exam trap: GAAP vs IFRS reversal is a favorite MCQ topic."

### trap (Exam Pitfall)
Identify where candidates commonly lose points and give a clear way to avoid the mistake.
Example: "TRAP: Goodwill impairment under ASC 350 does NOT use a 2-step test anymore (that was old GAAP). Now it's a 1-step quantitative test: compare carrying amount vs. fair value of reporting unit. Many prep materials still show the old 2-step — don't fall for it."

### rule (Memory Rule)
Present numerical thresholds, key dates, or classification rules with a memorization technique.
Example: "Lease classification thresholds (OWNES): O=Ownership transfer, W=Written bargain purchase option, N=Ninety percent (PV ≥ 90% of FV), E=Economic life (term ≥ 75%), S=Specialized asset. Any one = Finance Lease."

## Output Format (STRICT JSON — nothing else)
{
  "contentType": "textbook" | "mcq" | "tbs" | "other",
  "insights": [
    {
      "type": "concept" | "framework" | "trap" | "rule",
      "title": "Concise title (max 8 words)",
      "body": "The insight explained clearly in 2-4 sentences. Be specific and actionable.",
      "example": "A concrete example, mnemonic, or exam tip (optional but highly recommended)"
    }
  ]
}

## Quality Rules
- Extract 3-5 insights (prefer quality over quantity)
- NEVER just summarize or paraphrase — add exam-solving value
- Every insight must answer: "How does this help me pick the right answer on exam day?"
- Use concrete numbers, standards (ASC/IFRS), and real exam scenarios
- If the content is in Japanese, write insights in English (the exam is in English)
- Output ONLY valid JSON, no markdown, no commentary

---

Content to analyze:

`

function getDemoResponse() {
  return {
    contentType: "textbook",
    insights: [
      {
        type: "concept",
        title: "Demo Mode — API Key Required",
        body: "Essence Notes requires an OPENROUTER_API_KEY to analyze your study materials with AI. Set this in your Vercel environment variables or .env.local file to enable real analysis.",
        example: "Go to Vercel Dashboard → Settings → Environment Variables → Add OPENROUTER_API_KEY",
      },
    ],
  }
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function callModel(client: OpenAI, models: string[], messages: any[], maxTokens = 4000): Promise<string | null> {
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying ${model} after 3s delay...`)
          await wait(3000)
        }
        console.log(`Trying model: ${model} (attempt ${attempt + 1})`)
        const response = await client.chat.completions.create({
          model,
          max_tokens: maxTokens,
          temperature: 0.3,
          messages,
        } as any)
        const content = response.choices[0]?.message?.content?.trim()
        if (content) {
          console.log(`Success with model: ${model} (${content.length} chars)`)
          return content
        }
      } catch (err: any) {
        const msg = String(err?.message || "")
        console.log(`Model ${model} attempt ${attempt + 1} failed: ${msg.substring(0, 150)}`)
        if (msg.includes("timed out") || msg.includes("429") || msg.includes("rate")) continue
        break
      }
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = session.user.email
  const plan: Plan = (session.user.plan as Plan) || "free"

  // 2. Rate limit check
  try {
    const allowed = await checkRateLimit(email, "analyze")
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
    }
  } catch {
    // If Redis is not configured, skip rate limiting
  }

  // 3. Monthly usage check
  try {
    const usage = await getUsage(email, plan)
    if (usage.remaining <= 0) {
      return NextResponse.json({
        error: "LIMIT_REACHED",
        usage,
      }, { status: 403 })
    }
  } catch {
    // If Redis is not configured, skip usage check
  }

  const apiKey = process.env.OPENROUTER_API_KEY

  let images: string[] | undefined
  let text: string | undefined
  try {
    const body = await req.json()
    images = body.images
    text = body.text
  } catch {
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
  }

  const hasImages = images && images.length > 0
  const hasText = text && text.trim().length > 0

  if (!hasImages && !hasText) {
    return NextResponse.json({ error: "Please provide images or text" }, { status: 400 })
  }

  // Demo mode
  if (!apiKey || apiKey === "your-api-key-here") {
    const demo = getDemoResponse()
    return NextResponse.json({ ...demo, isDemo: true })
  }

  const client = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey })

  // 4. Select models based on plan
  const visionModels = VISION_MODELS[plan]
  const analysisModels = ANALYSIS_MODELS[plan]

  let extractedText: string

  if (hasText) {
    console.log("=== Text mode: Skipping OCR ===")
    extractedText = text!.trim()
  } else {
    // Image mode: Stage 1 OCR
    console.log("=== Stage 1: OCR ===")
    const imageContents: OpenAI.ChatCompletionContentPart[] = images!.map((dataUrl) => ({
      type: "image_url" as const,
      image_url: { url: dataUrl },
    }))

    const ocrResult = await callModel(client, visionModels, [
      { role: "user", content: [{ type: "text", text: OCR_PROMPT }, ...imageContents] },
    ], 4000)

    if (!ocrResult) {
      return NextResponse.json({ error: "Failed to extract text from images. Please try again or use text mode." }, { status: 500 })
    }
    extractedText = ocrResult
  }

  console.log(`Text length for analysis: ${extractedText.length}`)

  // Stage 2: Analysis
  console.log("=== Stage 2: Analysis ===")
  const analysisResult = await callModel(client, analysisModels, [
    { role: "system", content: "You are a USCPA exam expert. Always respond with valid JSON only." },
    { role: "user", content: ANALYSIS_PROMPT + extractedText },
  ], 4000)

  if (!analysisResult) {
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 })
  }

  // 5. Increment usage only on success
  let usageInfo = { used: 0, limit: PLAN_LIMITS[plan], remaining: PLAN_LIMITS[plan] }
  try {
    const newCount = await incrementUsage(email)
    usageInfo = { used: newCount, limit: PLAN_LIMITS[plan], remaining: Math.max(0, PLAN_LIMITS[plan] - newCount) }
  } catch {
    // If Redis is not configured, skip
  }

  // Parse JSON from analysis result
  let parsed: any
  try {
    let cleaned = analysisResult
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim()

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      throw new Error("No JSON found")
    }
  } catch {
    parsed = {
      contentType: "other",
      insights: [{ type: "concept", title: "Analysis Result", body: analysisResult.substring(0, 500) }],
    }
  }

  // Validate insights structure
  const validTypes = ["concept", "framework", "trap", "rule"]
  const insights = (parsed.insights || []).filter((i: any) =>
    i && typeof i.title === "string" && typeof i.body === "string" && validTypes.includes(i.type)
  )

  return NextResponse.json({
    contentType: parsed.contentType || "other",
    insights: insights.length > 0 ? insights : parsed.insights || [],
    usage: usageInfo,
  })
}
