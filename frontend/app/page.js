import LicenseUploader from "../components/LicenseUploader"
import Authorization from "@/components/Authorization";
import AdminPanel from "@/components/AdminPanel";
import BigTextbox from "@/components/BigTextbox";

export default function Home() {
  return (
    <main style={{ display: "flex", margin: 20, justifyContent: 'center'  }}>
      <script async src="https://docs.opencv.org/4.x/opencv.js"></script>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Authorization />
        <AdminPanel />
      </div>
      <LicenseUploader />
      <BigTextbox />
    </main>
  )
}