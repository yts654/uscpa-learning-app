"use client"

import { useState } from "react"

export default function TestPage() {
  const [items, setItems] = useState<string[]>(["Sample item 1"])
  const [text, setText] = useState("")

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Interactivity Test Page</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something here..."
          style={{ padding: "8px 12px", border: "2px solid #333", borderRadius: 8, fontSize: 16, flex: 1 }}
        />
        <button
          type="button"
          onClick={() => {
            if (!text.trim()) return
            setItems(prev => [...prev, text.trim()])
            setText("")
          }}
          style={{ padding: "8px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}
        >
          Add
        </button>
      </div>

      <p style={{ color: "#666", marginBottom: 10 }}>Input value: &quot;{text}&quot;</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ padding: "8px 12px", background: "#f3f4f6", marginBottom: 4, borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
            {item}
            <button type="button" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
