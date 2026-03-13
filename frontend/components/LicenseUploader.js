"use client"

import { useState } from "react"
import Tesseract, { PSM } from "tesseract.js"
import { parseLicense } from "@/utils/parseLicense"
import { preprocessImage } from "@/utils/preprocessImage"
import { parseHealthCard } from "@/utils/parseHealth"
import { getEligibility } from "@/api/api"

const primaryButton = {
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  transition: "background 0.2s"
}

const secondaryButton = {
  padding: "8px 14px",
  backgroundColor: "#f3f4f6",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
  marginBottom: "12px"
}

export default function LicenseUploader() {

  const [image, setImage] = useState(null)
  const [result, setResult] = useState(null)
  const [docType, setDocType] = useState("license")
  const [submitResult, setSubmitResult] = useState("")

  function handleUpload(e) {
    const file = e.target.files[0]
    if (file) setImage(file)
  }

  function toggleDocType() {
    setDocType(prev => prev === "license" ? "health" : "license")
    setResult(null)
  }

  async function extractText() {
    if (!image) return

    const processed = await preprocessImage(image);

    const { data } = await Tesseract.recognize(
      processed,
      "eng",
      {
        tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD,
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
      }
    )

    let parsed

    if (docType === "license") {
      parsed = parseLicense(data.text)
    } else {
      parsed = parseHealthCard(data.text)
    }

    setResult(parsed)
  }

  async function submitParsedData() {
    try {
      const edi = await getEligibility(result);
      setSubmitResult(edi);
    }
    catch (err) {
      alert(err);
    }
  }

  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #ddd",
        maxWidth: '100vw',
        margin: "0 auto",
      }}
    >

      {/* Toggle Button */}
      <button
        onClick={toggleDocType}
        style={secondaryButton}
      >
        Switch to {docType === "license" ? "Health Card" : "Driver License"}
      </button>

      <div style={{ marginBottom: 10 }}>
        Current mode: <b>{docType === "license" ? "Driver License" : "Health Card"}</b>
      </div>

      <input type="file" accept="image/*" onChange={handleUpload} />

      <button onClick={extractText} style={secondaryButton}>
        Extract Text
      </button>

      {result && docType === 'license' && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' }}>

          <label style={{ display: "block", marginTop: 15 }}>Name</label>
          <input
            value={result.name || ""}
            onChange={(e) =>
              setResult({ ...result, name: e.target.value })
            }
          />

          <label style={{ display: "block", marginTop: 15 }}>Date of Birth</label>
          <input
            value={result.dateOfBirth || ""}
            onChange={(e) =>
              setResult({ ...result, dateOfBirth: e.target.value })
            }
          />

          <label style={{ display: "block", marginTop: 15 }}>License Number</label>
          <input
            value={result.licenseNumber || ""}
            onChange={(e) =>
              setResult({ ...result, licenseNumber: e.target.value })
            }
          />

          <label style={{ display: "block", marginTop: 15 }}>Address</label>
          <input
            value={result.address || ""}
            onChange={(e) =>
              setResult({ ...result, address: e.target.value })
            }
          />

          <button
            onClick={submitParsedData}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Submit Document
          </button>
        </div>
      )}

      {result && docType !== 'license' && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' }}>

          <label style={{ display: "block", marginTop: 15 }}>Name</label>
          <input
            value={result.name || ""}
            onChange={(e) =>
              setResult({ ...result, name: e.target.value })
            }
          />

          <label style={{ display: "block", marginTop: 15 }}>Plan ID</label>
          <input
            value={result.planId || ""}
            onChange={(e) =>
              setResult({ ...result, planId: e.target.value })
            }
          />

          <label style={{ display: "block", marginTop: 15 }}>Member ID</label>
          <input
            value={result.memberId || ""}
            onChange={(e) =>
              setResult({ ...result, memberId: e.target.value })
            }
          />

          <label style={{ display: "block", marginTop: 15 }}>Group Number</label>
          <input
            value={result.groupNum || ""}
            onChange={(e) =>
              setResult({ ...result, groupNum: e.target.value })
            }
          />
          <button
            onClick={submitParsedData}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Submit Document
          </button>
        </div>
      )}

      {submitResult && (
        <div style={{ marginTop: 20 }}>

          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: 500
            }}
          >
            Submission Result
          </label>

          <textarea
            value={submitResult}
            readOnly
            style={{
              width: "100%",
              height: 120,
              padding: 10,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              background: "#f9fafb",
              fontFamily: "monospace",
              flex: '1'
            }}
          />

        </div>
      )}

    </div>
  )
}