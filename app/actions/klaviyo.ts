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

    console.log("Sending request to Klaviyo API v2023-02-22", JSON.stringify(requestBody, null, 2))

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Revision: "2023-02-22",
        Authorization: `Klaviyo-API-Key ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Klaviyo response status:", response.status)

    // Get the response body
    let responseBody
    const responseText = await response.text()
    try {
      responseBody = JSON.parse(responseText)
      console.log("Klaviyo response body:", responseBody)
    } catch (e) {
      console.log("Response is not JSON:", responseText)
      responseBody = responseText
    }

    if (!response.ok) {
      console.error("Klaviyo API error:", responseBody)
      return {
        success: false,
        message: "Failed to subscribe. Please try again later.",
        debug: responseBody,
      }
    }

    return {
      success: true,
      message: "Thank you for subscribing!",
      debug: responseBody,
    }
  } catch (error) {
    console.error("Error subscribing to Klaviyo:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      debug: error instanceof Error ? error.message : String(error),
    }
  }
}
