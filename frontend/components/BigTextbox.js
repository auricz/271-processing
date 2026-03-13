"use client"

import { getRole, listenFor271, publish271 } from "@/api/api"
import { useState, useRef } from "react"

export default function BigTextbox() {

  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const eventSourceRef = useRef(null)

  async function publishData() {

    if (!text.trim()) return

    setLoading(true)

    try {
      console.log(text);
      const data = await publish271(text);
      console.log(data)
      setResult(JSON.stringify(data, null, 2))

    } catch (err) {
      alert(err)
    }

    setLoading(false)
  }

  async function toggleSubscription() {
    if (!subscribed) {

      try {
        const role = await getRole();
        if (role === 'pending') {
          alert("You are still pending approval from your organization's admin");
          return;
        }
      }
      catch (err) {
        alert(err);
        return;
      }

      const es = listenFor271();

      es.onmessage = (event) => {
        try {
          const json = JSON.parse(event.data)
          setResult(prev =>
            JSON.stringify(json, null, 2) + "\n\n" + prev
          )
        } catch {
          setResult(prev =>
            event.data + "\n\n" + prev
          )
        }
      }

      es.onerror = (err) => {
        console.error("SSE error", err)
        es.close()
        setSubscribed(false)
      }

      eventSourceRef.current = es
      setSubscribed(true)

    } else {

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      eventSourceRef.current = null
      setSubscribed(false)

    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        background: "#fff",
        minHeight: 0
      }}
    >

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>

        <button
          onClick={toggleSubscription}
          style={{
            padding: "8px 14px",
            backgroundColor: subscribed ? "#dc2626" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          {subscribed ? "Cancel" : "Subscribe"}
        </button>

        <button
          onClick={publishData}
          disabled={loading}
          style={{
            padding: "8px 14px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>

      </div>

      {/* Input textbox */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter EDI data..."
        style={{
          flex: 1,
          width: "100%",
          padding: 10,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontFamily: "monospace",
          marginBottom: 10,
          resize: 'none'
        }}
      />

      {/* Output textbox */}
      <textarea
        value={result}
        readOnly
        placeholder="Results and SSE messages appear here..."
        style={{
          flex: 2,
          width: "100%",
          padding: 10,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontFamily: "monospace",
          background: "#f9fafb",
          overflow: "auto",
          resize: 'none'
        }}
      />

    </div>
  )
}