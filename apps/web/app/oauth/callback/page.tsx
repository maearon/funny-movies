"use client"

import { useEffect } from "react"

export default function CallbackPage() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code")

    if (!code) return

    const run = async () => {
      try {
        const res = await fetch("/api/google-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await res.json()

        if (!res.ok) {
          console.error("OAuth error:", data)
          return
        }

        // ✅ lưu access token
        if (data.access_token) {
          localStorage.setItem("youtube_oauth_token", data.access_token)
        }

        // ✅ redirect về home
        window.location.href = "/"
      } catch (err) {
        console.error("Callback error:", err)
      }
    }

    run()
  }, [])

  return <div>Logging in...</div>
}