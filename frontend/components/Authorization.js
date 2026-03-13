"use client"

import { setCreds, signup } from "@/api/api"
import { useEffect, useState } from "react"

export default function Authorization() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [organization, setOrganization] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCreds({ username, password, organization });
  }, [username, password, organization]);

  async function handleRegister() {

    if (!username || !password || !organization) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    try {
      const { username: newUser, role } = await signup(username, password, organization);
      if (role === 'admin') 
        alert(`Successfully registered ${newUser} as admin to ${organization}`);
      else
        alert(`Successfully created ${newUser}, now awaiting approval from admin of ${organization}`);

    } catch (err) {
      alert(err)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        background: "#ffffff"
      }}
    >

      <h2 style={{ marginBottom: 20, fontSize: 'x-large', fontWeight: 'bold' }}>
        Login / Register
      </h2>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Username
        </label>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #d1d5db",
            borderRadius: 6
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #d1d5db",
            borderRadius: 6
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Organization
        </label>

        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #d1d5db",
            borderRadius: 6
          }}
        />
      </div>

      <p style={{ textAlign: 'center', padding: '10px'}}>
        Leave your credentials in the boxes above to authenticate action. 
        Otherwise, click the button below to create an account
      </p>

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        {loading ? "Registering..." : "Register"}
      </button>

    </div>
  )
}