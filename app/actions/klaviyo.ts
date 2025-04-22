"use server"

import { z } from "zod"

// Email validation schema
const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SubscribeResult = {
  success: boolean
  message: string
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
    })

    if (!apiKey || !listId) {
      console.error("Missing Klaviyo API key or list ID")
      return {
        success: false,
        message: "Server configuration error",
      }
    }

    // Direct integration with Klaviyo using their List API
    const klaviyoUrl = `https://a.klaviyo.com/api/v2/list/${listId}/subscribe`

    const klaviyoData = {
      api_key: apiKey,
      profiles: [
        {
          email: email,
        },
      ],
    }

    console.log("Sending request to Klaviyo:", klaviyoUrl)

    const response = await fetch(klaviyoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(klaviyoData),
    })

    console.log("Klaviyo response status:", response.status)

    let responseData
    try {
      responseData = await response.json()
      console.log("Klaviyo response data:", responseData)
    } catch (e) {
      const text = await response.text()
      console.log("Klaviyo response text:", text)
    }

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to subscribe. Please try again later.",
      }
    }

    return {
      success: true,
      message: "Thank you for subscribing!",
    }
  } catch (error) {
    console.error("Error subscribing to Klaviyo:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
