'use client';
import { useEffect, useState } from "react";
import LicenseUploader from "../components/LicenseUploader"
import Authorization from "@/components/Authorization";
import AdminPanel from "@/components/AdminPanel";

export default function Home() {
  const [creds, setCreds] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    console.log(result)
  }, [result])
  

  return (
    <main style={{ display: "flex", margin: 20, justifyContent: 'center'  }}>
      <script async src="https://docs.opencv.org/4.x/opencv.js"></script>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Authorization />
        <AdminPanel />
      </div>
      <LicenseUploader onUpload={setResult}/>
    </main>
  )
}