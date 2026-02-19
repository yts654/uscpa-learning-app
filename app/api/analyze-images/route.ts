import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

// Allow long-running analysis (Hobby plan max: 60s)
export const maxDuration = 60

// Stage 1: Vision model extracts text from images
const VISION_MODELS = [
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-12b-it:free",
]

// Stage 2: Reasoning model analyzes the extracted text
const REASONING_MODELS = [
  "deepseek/deepseek-r1-0528:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
]

const OCR_PROMPT = `You are an expert OCR assistant. Extract ALL text content from the provided screenshot(s) as accurately as possible.

Rules:
- Preserve the original structure (headings, bullet points, numbered lists, tables)
- Include ALL text visible in the image(s)
- If it's a multiple choice question, clearly mark the question, each option (A, B, C, D), and any explanation
- If it's a textbook page, preserve section headers and paragraph structure
- Output the extracted text in its original language (English or Japanese)
- If there are multiple images, separate each with "---"
- Do NOT add any commentary, just extract the text faithfully`

const ANALYSIS_PROMPT = `You are an expert USCPA (US Certified Public Accountant) exam tutor with 15+ years of teaching experience.
Extract the "essential insights" from the following USCPA study content that directly help pass the exam.

## Your Role
Not just summarizing the text, but teaching practical thinking: "How do I use this knowledge to solve exam questions?"

## 4 Types of Insights to Extract

### concept (Core Concept)
Clarify the underlying principles behind an accounting treatment.
Good example: "The essence of depreciation is the matching principle. Allocate costs to match the pattern of economic benefit consumption. Straight-line = even consumption, declining balance = front-loaded consumption."
Bad example: "There are straight-line and declining balance methods." (This is just listing facts.)

### framework (Thinking Framework)
Show step-by-step decision process when approaching a problem.
Good example: "Lease classification steps: (1) Transfer of ownership? → (2) Bargain purchase option? → (3) Lease term >= 75% of economic life? → (4) PV >= 90% of fair value? → Any Yes = Finance Lease"
Bad example: "There are Operating Leases and Finance Leases."

### trap (Common Pitfall)
Point out where exam takers commonly make mistakes and how to avoid them.
Good example: "Unrealized gains/losses on AFS securities go to OCI, not P&L. Remember: 'Available' = not sold yet = OCI."
Bad example: "Be careful with AFS securities."

### rule (Memory Rule)
Present numerical thresholds or requirements with memorization tips.
Good example: "Materiality: Deferred tax asset recoverability → 'more likely than not' (>50%). SEC Small Reporting Company → public float < $250M."
Bad example: "There are several numerical standards."

## Output Format (Strict — JSON only)
{
  "contentType": "textbook" | "mcq" | "tbs" | "other",
  "insights": [
    {
      "type": "concept" | "framework" | "trap" | "rule",
      "title": "Short title (max 8 words)",
      "body": "Essential insight (1-4 sentences)",
      "example": "Concrete example or memorization tip (optional)"
    }
  ]
}

## Important Rules
- Always extract 2-5 insights
- Never just summarize the text superficially
- Always think: "So what? How does this help on the exam?"
- Output ONLY JSON, no other text

---

Content to analyze:

`

function getDemoResponse() {
  return {
    contentType: "textbook",
    insights: [
      {
        type: "concept",
        title: "Demo: Core Concept",
        body: "This is demo mode. To use actual AI analysis, set OPENROUTER_API_KEY in your .env.local file.",
        example: "OPENROUTER_API_KEY=sk-or-v1-xxxxx",
      },
      {
        type: "framework",
        title: "Demo: Framework",
        body: "Once the API key is configured, uploaded images will be automatically analyzed by AI to extract insights directly relevant to the USCPA exam.",
      },
    ],
  }
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function callModel(client: OpenAI, models: string[], messages: any[]): Promise<string | null> {
  for (const model of models) {
    // Try each model up to 2 times (retry once on timeout/429)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying ${model} after 5s delay...`)
          await wait(5000)
        }
        console.log(`Trying model: ${model} (attempt ${attempt + 1})`)
        const response = await client.chat.completions.create({
          model,
          max_tokens: 3000,
          timeout: 180000, // 3 minutes
          messages,
        } as any)
        const content = response.choices[0]?.message?.content?.trim()
        if (content) {
          console.log(`Success with model: ${model}`)
          return content
        }
      } catch (err: any) {
        const msg = String(err?.message || "")
        console.log(`Model ${model} attempt ${attempt + 1} failed: ${msg.substring(0, 100)}`)
        // Only retry on timeout or 429
        if (msg.includes("timed out") || msg.includes("429")) continue
        break // Other errors: skip to next model
      }
    }
  }
  return null
}

export async function POST(req: NextRequest) {
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

  let extractedText: string

  if (hasText) {
    // === Text mode: Skip OCR, go directly to analysis ===
    console.log("=== Text mode: Skipping OCR ===")
    extractedText = text!.trim()
  } else {
    // === Image mode: Stage 1 OCR ===
    console.log("=== Stage 1: OCR ===")
    const imageContents: OpenAI.ChatCompletionContentPart[] = images!.map((dataUrl) => ({
      type: "image_url" as const,
      image_url: { url: dataUrl },
    }))

    const ocrResult = await callModel(client, VISION_MODELS, [
      { role: "user", content: [{ type: "text", text: OCR_PROMPT }, ...imageContents] },
    ])

    if (!ocrResult) {
      return NextResponse.json({ error: "Failed to extract text from images" }, { status: 500 })
    }
    extractedText = ocrResult
  }

  console.log(`Text length for analysis: ${extractedText.length}`)

  // === Stage 2: Analysis — Deep reasoning ===
  console.log("=== Stage 2: Analysis ===")
  const analysisResult = await callModel(client, REASONING_MODELS, [
    { role: "user", content: ANALYSIS_PROMPT + extractedText },
  ])

  if (!analysisResult) {
    return NextResponse.json({ error: "Failed to analyze content" }, { status: 500 })
  }

  // Parse JSON from analysis result
  let parsed: any
  try {
    // Remove markdown code blocks and any thinking tags
    let cleaned = analysisResult
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/^```json\s*/m, "")
      .replace(/\s*```$/m, "")
      .trim()

    // Find the JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      throw new Error("No JSON found")
    }
  } catch {
    // Fallback: wrap raw text as single insight
    parsed = {
      contentType: "other",
      insights: [{ type: "concept", title: "Analysis Result", body: analysisResult.substring(0, 500) }],
    }
  }

  return NextResponse.json({
    contentType: parsed.contentType || "other",
    insights: parsed.insights || [],
  })
}
