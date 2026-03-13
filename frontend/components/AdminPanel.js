"use client"

import { deleteUser, updateRole } from "@/api/api"
import { useState } from "react"

export default function AdminPanel() {

  const [username, setUsername] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)

  async function setRoleHandler() {

    if (!username) {
      alert("Please enter a username")
      return
    }

    setLoading(true)

    try {
      await updateRole(username, role);
      console.log("update")
      alert(`${username} now has role "${role}"`)

    } catch (err) {
      alert(err)
    }

    setLoading(false)
  }

  async function deleteUserHandler() {

    if (!username) {
      alert("Please enter a username")
      return
    }

    if (!confirm("Are you sure you want to delete this user?")) return

    setLoading(true)

    try {

      await deleteUser(username);
      alert(`${username} has been deleted`)

      setUsername("")

    } catch (err) {
      alert(err)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        background: "#fff"
      }}
    >

      <h2 style={{ marginBottom: 20, fontSize: 'x-large', fontWeight: 'bold' }}>
        Admin Only
      </h2>

      <div style={{ marginBottom: 16 }}>
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

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          Role
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #d1d5db",
            borderRadius: 6
          }}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 10 }}>

        <button
          onClick={setRoleHandler}
          disabled={loading}
          style={{
            flex: 1,
            padding: 10,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Set Role
        </button>

        <button
          onClick={deleteUserHandler}
          disabled={loading}
          style={{
            flex: 1,
            padding: 10,
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Delete User
        </button>

      </div>

    </div>
  )
}