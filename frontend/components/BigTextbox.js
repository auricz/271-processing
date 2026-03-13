"use client"

import { publish271 } from "@/api/api"
import { useState } from "react"

export default function BigTextbox() {

  const [inputText, setInputText] = useState("")
  const [loadingPublish, setLoadingPublish] = useState(false)
  const [result, setResult] = useState("");

  async function onPublish() {
    setResult("");
    if (!inputText.trim()) {
      alert("Textbox is empty")
      return
    }

    setLoadingPublish(true)

    try {
      const jsonData = await publish271(inputText);
      setResult(JSON.stringify(jsonData, null, 2))

    } catch (err) {
      alert(err.message)
    }

    setLoadingPublish(false)
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        background: "#ffffff",
        flex: 1,
        flexDirection: 'column'
      }}
    >

      <button
        onClick={onPublish}
        disabled={loadingPublish}
        style={{
          padding: "10px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "500",
          marginBottom: 15
        }}
      >
        {loadingPublish ? "Publishing..." : "Publish"}
      </button>

      {/* Main EDI textbox */}
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter EDI data..."
        style={{
          width: "100%",
          height: 300,
          padding: 10,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          resize: "vertical",
          fontFamily: "monospace",
          marginBottom: 20
        }}
      />

      {/* Result textbox */}
      <textarea
        value={result}
        readOnly
        placeholder="Ouput will appear here..."
        style={{
          width: "100%",
          height: 500,
          padding: 10,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          resize: "vertical",
          fontFamily: "monospace",
          backgroundColor: "#f9fafb"
        }}
      />

    </div>
  )
}