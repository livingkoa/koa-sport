"use client"

import { useState } from "react"
import type React from "react"
import { subscribeToKlaviyoList } from "@/app/actions/klaviyo"

export default function EmailForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with email:", email)

    if (!email) {
      setStatus("error")
      setMessage("Please enter your email address")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setMessage("")
    setDebugInfo(null)

    try {
      const formData = new FormData()
      formData.append("email", email)

      console.log("Calling server action with email:", email)
      const result = await subscribeToKlaviyoList(formData)
      console.log("Server action result:", result)

      // Store debug info if available
      if (result.debug) {
        setDebugInfo(result.debug)
      }

      if (result.success) {
        setStatus("success")
        setMessage(result.message)
        setEmail("")
      } else {
        setStatus("error")
        setMessage(result.message)
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      setStatus("error")
      setMessage("An unexpected error occurred. Please try again.")
      setDebugInfo(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="w-full bg-[#777777] rounded-3xl p-2">
      <h2 className="text-[#5eff45] text-center text-sm font-light mb-2 uppercase tracking-wider">Run with us</h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          name="email"
          placeholder="EMAIL ADDRESS"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="w-full bg-[#e0e0e0] text-black text-sm placeholder-gray-500 px-4 py-3 rounded-full text-center focus:outline-none"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-[#5eff45] text-black text-sm py-3 rounded-full uppercase tracking-wider hover:bg-opacity-90 transition-all"
        >
          {status === "loading" ? "Submitting..." : "Submit"}
        </button>

        {message && (
          <div
            className={`text-center text-sm mt-2 ${status === "success" ? "text-[#5eff45]" : "text-red-400"}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        {/* Debug info - only visible during development */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-white overflow-auto max-h-40">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </form>
    </div>
  )
}
