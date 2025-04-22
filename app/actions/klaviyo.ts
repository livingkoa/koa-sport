"use server"

import { z } from "zod"

// Email validation schema
const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SubscribeResult = {
  success: boolean
  message: string
  debug?: any
}

export async function subscribeToKlaviyoList(formData: FormData): Promise<SubscribeResult> {
  console.log("Server action called with email:", formData.get("email"))

  try {
    // Extract and validate email
    const email = formData.get("email") as string
    const validationResult = EmailSchema.safeParse({ email })

    if (!validationResult.success) {
      console.log("Email validation failed:", validationResult.error.errors)
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Get environment variables
    const apiKey = process.env.KLAVIYO_API_KEY
    const listId = process.env.KLAVIYO_LIST_ID

    console.log("Environment variables check:", {
      hasApiKey: !!apiKey,
      hasListId: !!listId,
      apiKeyLength: apiKey ? apiKey.length : 0,
      listIdLength: listId ? listId.length : 0,
    })

    if (!apiKey || !listId) {
      console.error("Missing Klaviyo API key or list ID")
      return {
        success: false,
        message: "Server configuration error",
        debug: { missingApiKey: !apiKey, missingListId: !listId },
      }
    }

    // Use the simpler Klaviyo List API for more reliable integration
    const url = `https://a.klaviyo.com/api/v2/list/${listId}/subscribe`

    const data = {
      profiles: [{ email }],
      api_key: apiKey,
    }

    console.log("Sending request to Klaviyo:", url)
    console.log("Request data:", JSON.stringify(data, null, 2))

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("Klaviyo response status:", response.status)
      console.log("Klaviyo response headers:", Object.fromEntries([...response.headers.entries()]))

      const responseText = await response.text()
      console.log("Klaviyo response body:", responseText)

      if (!response.ok) {
        console.error("Klaviyo API error:", responseText)
        return {
          success: false,
          message: "Failed to subscribe. Please try again later.",
          debug: {
            status: response.status,
            responseText,
            requestData: data,
          },
        }
      }

      return {
        success: true,
        message: "Thank you for subscribing!",
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return {
        success: false,
        message: "Network error when contacting Klaviyo.",
        debug: { error: fetchError.toString() },
      }
    }
  } catch (error) {
    console.error("Error subscribing to Klaviyo:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      debug: { error: error.toString() },
    }
  }
}
