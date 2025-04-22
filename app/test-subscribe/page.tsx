"use client"

import type React from "react"

import { useState } from "react"
import { subscribeToKlaviyoList } from "@/app/actions/klaviyo"

export default function TestSubscribe() {
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [envVars, setEnvVars] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("email", email)

      console.log("Submitting test with email:", email)
      const response = await subscribeToKlaviyoList(formData)
      console.log("Test response:", response)

      setResult(response)
    } catch (error) {
      console.error("Test error:", error)
      setResult({ error: error.toString() })
    } finally {
      setLoading(false)
    }
  }

  const checkEnvVars = async () => {
    try {
      const response = await fetch("/api/test-klaviyo")
      const data = await response.json()
      setEnvVars(data)
    } catch (error) {
      setEnvVars({ error: error.toString() })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Klaviyo Test Subscribe</h1>

        <div className="mb-6">
          <button onClick={checkEnvVars} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Check Environment Variables
          </button>

          {envVars && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              <pre className="text-xs">{JSON.stringify(envVars, null, 2)}</pre>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="test@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Subscribe"}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <div className={`p-4 rounded ${result.success ? "bg-green-100" : "bg-red-100"}`}>
              <p className="font-medium">{result.message}</p>
              {result.debug && (
                <div className="mt-4 overflow-auto">
                  <p className="text-sm font-medium mb-1">Debug Info:</p>
                  <pre className="text-xs bg-white p-2 rounded">{JSON.stringify(result.debug, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
