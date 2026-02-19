"use client"

import { useState, useRef } from "react"
import {
  Plus, X, Image as ImageIcon, Lightbulb, ChevronDown, ChevronUp,
  Sparkles, Loader2, Trash2, Brain, AlertTriangle, BookOpen, Bookmark, Type,
} from "lucide-react"
import { type EssenceNote, type Insight, type InsightType } from "@/lib/study-data"

const INSIGHT_CONFIG: Record<InsightType, { label: string; color: string; bgColor: string; icon: any }> = {
  concept: { label: "Core Concept", color: "hsl(220, 70%, 50%)", bgColor: "hsl(220, 70%, 95%)", icon: Lightbulb },
  framework: { label: "Framework", color: "hsl(160, 60%, 38%)", bgColor: "hsl(160, 60%, 93%)", icon: Brain },
  trap: { label: "Pitfall", color: "hsl(0, 65%, 50%)", bgColor: "hsl(0, 65%, 95%)", icon: AlertTriangle },
  rule: { label: "Memory Rule", color: "hsl(270, 55%, 50%)", bgColor: "hsl(270, 55%, 94%)", icon: Bookmark },
}

interface EssenceNotesProps {
  chapterId: string
  notes: EssenceNote[]
  onAddNote: (note: EssenceNote) => void
  onRemoveNote: (noteId: string) => void
  accentColor: string
}

export function EssenceNotes({ chapterId, notes, onAddNote, onRemoveNote, accentColor }: EssenceNotesProps) {
  const [inputMode, setInputMode] = useState<"image" | "text">("image")
  const [images, setImages] = useState<string[]>([])
  const [pastedText, setPastedText] = useState("")
  const [analysisResult, setAnalysisResult] = useState<{ contentType: string; insights: Insight[]; isDemo?: boolean } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeStatus, setAnalyzeStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<InsightType | "all">("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addImageFromFile(file: File) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImages(prev => [...prev, ev.target?.result as string])
      setError(null)
      setAnalysisResult(null)
    }
    reader.readAsDataURL(file)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (let i = 0; i < files.length; i++) addImageFromFile(files[i])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items
    let hasImage = false
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        hasImage = true
        const file = items[i].getAsFile()
        if (file) addImageFromFile(file)
      }
    }
    if (hasImage) e.preventDefault()
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    if (images.length <= 1) setAnalysisResult(null)
  }

  function clearAll() {
    setImages([])
    setPastedText("")
    setAnalysisResult(null)
    setError(null)
  }

  async function handleAnalyze() {
    const hasInput = inputMode === "image" ? images.length > 0 : pastedText.trim().length > 0
    if (!hasInput) return
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setAnalyzeStatus(inputMode === "image" ? "Extracting text..." : "AI analyzing...")

    // Update status periodically
    const statusMessages = [
      "Extracting text...",
      "Loading images...",
      "AI analyzing content...",
      "Extracting key insights...",
      "Structuring insights...",
      "Almost there...",
    ]
    let statusIdx = 0
    const statusInterval = setInterval(() => {
      statusIdx = Math.min(statusIdx + 1, statusMessages.length - 1)
      setAnalyzeStatus(statusMessages[statusIdx])
    }, 15000)

    try {
      const res = await fetch("/api/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputMode === "image" ? { images } : { text: pastedText }),
      })
      clearInterval(statusInterval)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Analysis failed")
        return
      }

      setAnalysisResult({
        contentType: data.contentType,
        insights: data.insights || [],
        isDemo: data.isDemo,
      })
    } catch (err: any) {
      clearInterval(statusInterval)
      setError(err.message || "Network error")
    } finally {
      setIsAnalyzing(false)
      setAnalyzeStatus("")
    }
  }

  function handleSaveAll() {
    if (!analysisResult) return
    onAddNote({
      id: `en-${Date.now()}`,
      chapterId,
      imageUrls: [...images],
      contentType: analysisResult.contentType as any,
      insights: analysisResult.insights,
      createdAt: new Date().toISOString(),
    })
    clearAll()
  }

  function handleSaveInsight(insight: Insight) {
    onAddNote({
      id: `en-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      chapterId,
      imageUrls: images.length > 0 ? [images[0]] : [],
      contentType: (analysisResult?.contentType || "other") as any,
      insights: [insight],
      createdAt: new Date().toISOString(),
    })
    setAnalysisResult(prev => {
      if (!prev) return null
      const remaining = prev.insights.filter(i => i !== insight)
      return remaining.length > 0 ? { ...prev, insights: remaining } : null
    })
  }

  // Flatten all insights from all notes for filtering
  const allInsights = notes.flatMap((note, noteIdx) =>
    note.insights.map((insight, insightIdx) => ({
      ...insight,
      noteId: note.id,
      noteIdx,
      insightIdx,
      imageUrls: note.imageUrls,
      createdAt: note.createdAt,
    }))
  )
  const filteredInsights = filterType === "all" ? allInsights : allInsights.filter(i => i.type === filterType)

  const contentTypeLabels: Record<string, string> = {
    textbook: "Textbook",
    mcq: "MCQ",
    tbs: "TBS Simulation",
    other: "Other",
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" onPaste={handlePaste}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
          <Lightbulb className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Essence Notes</h3>
        <span className="ml-auto text-[10px] font-bold text-[hsl(0,0%,100%)] px-2 py-0.5 rounded-full" style={{ backgroundColor: accentColor }}>
          {allInsights.length}
        </span>
      </div>

      {/* Input Mode Tabs + Content */}
      <div className="p-5 border-b border-border bg-muted/10 space-y-3">
        {/* Mode tabs */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => { setInputMode("image"); setAnalysisResult(null); setError(null) }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${inputMode === "image" ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Screenshot
          </button>
          <button
            type="button"
            onClick={() => { setInputMode("text"); setAnalysisResult(null); setError(null) }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${inputMode === "text" ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
          >
            <Type className="w-3.5 h-3.5" /> Paste Text
          </button>
        </div>

        {/* Image mode */}
        {inputMode === "image" && (
          <>
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {images.length} image{images.length !== 1 ? "s" : ""}
                  </p>
                  <button type="button" onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {images.map((img, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-[4/3]">
                      <img src={img} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover bg-muted/30" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs">
                {images.length === 0 ? "Upload or paste screenshots (Cmd+V)" : "Add image"}
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </>
        )}

        {/* Text mode */}
        {inputMode === "text" && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Paste MCQ or text content directly
            </p>
            <textarea
              value={pastedText}
              onChange={(e) => { setPastedText(e.target.value); setAnalysisResult(null); setError(null) }}
              placeholder={"Paste the question, options, and explanation as-is.\nExample:\nWhich of the following is correct regarding...\nA. ...\nB. ...\nC. ...\nD. ...\n\nExplanation: The correct answer is B because..."}
              rows={10}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-vertical font-mono leading-relaxed"
            />
            {pastedText.trim() && (
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">{pastedText.trim().length} chars</p>
                <button type="button" onClick={() => setPastedText("")} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analyze button */}
        {((inputMode === "image" && images.length > 0) || (inputMode === "text" && pastedText.trim())) && !analysisResult && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full px-4 py-3 rounded-lg text-sm font-bold text-[hsl(0,0%,100%)] hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {analyzeStatus || "Analyzing..."}</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Extract Insights with AI {inputMode === "image" ? "(1-2 min)" : "(30s-1 min)"}</>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>
        )}

        {/* Analysis results */}
        {analysisResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  AI Results — {contentTypeLabels[analysisResult.contentType] || "Other"}
                </span>
                {analysisResult.isDemo && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">DEMO</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg text-[hsl(0,0%,100%)] hover:opacity-90 transition-all flex items-center gap-1"
                style={{ backgroundColor: accentColor }}
              >
                <Plus className="w-3 h-3" /> Save All
              </button>
            </div>

            {analysisResult.insights.map((insight, i) => {
              const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.concept
              const Icon = config.icon
              return (
                <div key={i} className="rounded-lg border overflow-hidden" style={{ borderColor: `${config.color}30` }}>
                  <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: config.bgColor }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: config.color }}>{config.label}</span>
                    <span className="text-xs font-bold text-foreground ml-1">{insight.title}</span>
                    <button
                      type="button"
                      onClick={() => handleSaveInsight(insight)}
                      className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded text-[hsl(0,0%,100%)] hover:opacity-90 transition-all"
                      style={{ backgroundColor: config.color }}
                    >
                      Save
                    </button>
                  </div>
                  <div className="px-3 py-2.5 bg-background">
                    <p className="text-sm text-card-foreground leading-relaxed">{insight.body}</p>
                    {insight.example && (
                      <p className="text-xs text-muted-foreground mt-1.5 pl-3 border-l-2" style={{ borderColor: `${config.color}40` }}>
                        e.g. {insight.example}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      {allInsights.length > 0 && (
        <div className="px-5 py-2.5 border-b border-border bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${filterType === "all" ? "text-[hsl(0,0%,100%)]" : "text-muted-foreground hover:text-foreground bg-muted/50"}`}
            style={filterType === "all" ? { backgroundColor: accentColor } : {}}
          >
            All ({allInsights.length})
          </button>
          {(Object.keys(INSIGHT_CONFIG) as InsightType[]).map((type) => {
            const count = allInsights.filter(i => i.type === type).length
            if (count === 0) return null
            const config = INSIGHT_CONFIG[type]
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${filterType === type ? "text-[hsl(0,0%,100%)]" : "text-muted-foreground hover:text-foreground bg-muted/50"}`}
                style={filterType === type ? { backgroundColor: config.color } : {}}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Saved notes list */}
      <div className="divide-y divide-border">
        {allInsights.length === 0 && (
          <div className="p-8 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notes yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload screenshots to extract key insights with AI</p>
          </div>
        )}
        {filteredInsights.map((insight, index) => {
          const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.concept
          const Icon = config.icon
          const isExpanded = expandedNoteId === `${insight.noteId}-${insight.insightIdx}`
          const hasImages = insight.imageUrls.length > 0

          return (
            <div key={`${insight.noteId}-${insight.insightIdx}`} className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: config.color }} />
              <div className="pl-5 pr-4 py-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5" style={{ backgroundColor: config.bgColor }}>
                    <Icon className="w-3 h-3" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: config.bgColor, color: config.color }}>
                        {config.label}
                      </span>
                      <span className="text-xs font-bold text-card-foreground">{insight.title}</span>
                    </div>
                    <p className="text-sm text-card-foreground leading-relaxed">{insight.body}</p>
                    {insight.example && (
                      <p className="text-xs text-muted-foreground mt-1.5 pl-3 border-l-2" style={{ borderColor: `${config.color}40` }}>
                        e.g. {insight.example}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(insight.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {hasImages && (
                        <button
                          type="button"
                          onClick={() => setExpandedNoteId(isExpanded ? null : `${insight.noteId}-${insight.insightIdx}`)}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {isExpanded ? "Hide" : "Source"}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                    {hasImages && isExpanded && (
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {insight.imageUrls.map((url, imgIdx) => (
                          <div key={imgIdx} className="rounded-lg overflow-hidden border border-border">
                            <img src={url} alt={`Source ${imgIdx + 1}`} className="w-full max-h-60 object-contain bg-muted/30" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveNote(insight.noteId)}
                    className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 transition-all"
                    aria-label="Delete"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
