"use client"

import type React from "react"

import { useState } from "react"
import { subscribeToKlaviyoList } from "@/app/actions/klaviyo"

export default function TestKlaviyoPage() {
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)

      const response = await subscribeToKlaviyoList(formData)
      setResult(response)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Klaviyo Integration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
          {loading ? "Testing..." : "Test Subscription"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="font-bold">Result:</h2>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
