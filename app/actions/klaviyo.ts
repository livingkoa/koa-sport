"use server"

import { z } from "zod"

// Email validation schema
const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SubscribeResult = {
  success: boolean
  message: string
  status?: number
  testEmail?: string
  response?: any
  requestBody?: any
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
      }
    }

    // Use the v2 API which is more reliable for simple subscriptions
    const url = `https://a.klaviyo.com/api/v2/list/${listId}/subscribe`

    const data = {
      profiles: [{ email }],
      api_key: apiKey,
    }

    console.log("Sending request to Klaviyo v2 API:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    console.log("Klaviyo response status:", response.status)

    // For debugging
    let responseText = ""
    try {
      responseText = await response.text()
      console.log("Klaviyo response body:", responseText)
    } catch (e) {
      console.log("Could not get response text:", e)
    }

    if (!response.ok) {
      console.error("Klaviyo API error:", responseText)

      // If we get a 401 with the v2 API, try the newer API as fallback
      if (response.status === 401) {
        console.log("Trying newer Klaviyo API as fallback...")
        return await subscribeWithNewerApi(email, apiKey, listId)
      }

      return {
        success: false,
        message: "Failed to subscribe. Please try again later.",
        status: response.status,
        testEmail: email,
        response: responseText ? JSON.parse(responseText) : null,
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

// Helper function to try the newer Klaviyo API
async function subscribeWithNewerApi(email: string, apiKey: string, listId: string): Promise<SubscribeResult> {
  try {
    const url = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs"

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

    console.log("Sending request to newer Klaviyo API:", url)
    console.log("Request body:", JSON.stringify(requestBody))

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

    console.log("Newer API response status:", response.status)

    let responseData
    try {
      responseData = await response.json()
      console.log("Newer API response:", responseData)
    } catch (e) {
      console.log("Could not parse JSON response:", e)
    }

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to subscribe. Please try again later.",
        status: response.status,
        testEmail: email,
        response: responseData,
        requestBody,
      }
    }

    return {
      success: true,
      message: "Thank you for subscribing!",
    }
  } catch (error) {
    console.error("Error with newer Klaviyo API:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
