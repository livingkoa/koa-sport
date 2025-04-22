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

    // Using the current Klaviyo API (2023-02-22)
    const url = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs"

    // Prepare the request body according to the new API format
    const requestBody = {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email: email,
                },
              },
            ],
          },
          list_id: listId,
        },
      },
    }

    console.log("Sending request to Klaviyo API v2023-02-22")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Revision: "2023-02-22",
        Authorization: `Klaviyo-API-Key ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    })

    console.log("Klaviyo response status:", response.status)

    let responseData
    try {
      responseData = await response.text()
      console.log("Klaviyo response:", responseData)
    } catch (e) {
      console.log("Could not parse response as text:", e)
    }

    if (!response.ok) {
      console.error("Klaviyo API error:", responseData)
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
