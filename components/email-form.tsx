"use client"

import { useState, useTransition } from "react"
import type React from "react"
import { subscribeToKlaviyoList } from "@/app/actions/klaviyo"

export default function EmailForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "idle" }>({
    text: "",
    type: "idle",
  })
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" })
      return
    }

    startTransition(async () => {
      const result = await subscribeToKlaviyoList(new FormData(e.target as HTMLFormElement))

      if (result.success) {
        setEmail("")
        setMessage({ text: result.message, type: "success" })
      } else {
        setMessage({ text: result.message, type: "error" })
      }
    })
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
          disabled={isPending}
          className="w-full bg-[#e0e0e0] text-black text-sm placeholder-gray-500 px-4 py-3 rounded-full text-center focus:outline-none"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#5eff45] text-black text-sm py-3 rounded-full uppercase tracking-wider hover:bg-opacity-90 transition-all"
        >
          {isPending ? "Submitting..." : "Submit"}
        </button>

        {message.text && (
          <div className={`text-center text-sm mt-2 ${message.type === "success" ? "text-[#5eff45]" : "text-red-400"}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
