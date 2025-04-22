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

    // First, create or update the profile
    const createProfileUrl = "https://a.klaviyo.com/api/profiles/"

    const profileData = {
      data: {
        type: "profile",
        attributes: {
          email: email,
        },
      },
    }

    console.log("Creating/updating profile in Klaviyo:", createProfileUrl)
    console.log("Profile data:", JSON.stringify(profileData, null, 2))

    try {
      // Step 1: Create or update the profile
      const profileResponse = await fetch(createProfileUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Revision: "2023-10-15",
          Authorization: `Klaviyo-API-Key ${apiKey}`,
        },
        body: JSON.stringify(profileData),
      })

      console.log("Profile response status:", profileResponse.status)

      const profileResponseText = await profileResponse.text()
      console.log("Profile response body:", profileResponseText)

      let profileResponseData = null
      let profileId = null

      try {
        if (profileResponseText) {
          profileResponseData = JSON.parse(profileResponseText)
          profileId = profileResponseData?.data?.id
        }
      } catch (e) {
        console.error("Error parsing profile response:", e)
      }

      if (!profileResponse.ok) {
        return {
          success: false,
          message: "Failed to create subscriber profile. Please try again later.",
          debug: {
            status: profileResponse.status,
            responseText: profileResponseText,
            responseData: profileResponseData,
            requestData: profileData,
          },
        }
      }

      if (!profileId) {
        return {
          success: false,
          message: "Failed to get profile ID. Please try again later.",
          debug: {
            profileResponseData,
          },
        }
      }

      // Step 2: Subscribe the profile to the list
      const subscribeUrl = `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`

      const subscribeData = {
        data: [
          {
            type: "profile",
            id: profileId,
          },
        ],
      }

      console.log("Subscribing profile to list:", subscribeUrl)
      console.log("Subscribe data:", JSON.stringify(subscribeData, null, 2))

      const subscribeResponse = await fetch(subscribeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Revision: "2023-10-15",
          Authorization: `Klaviyo-API-Key ${apiKey}`,
        },
        body: JSON.stringify(subscribeData),
      })

      console.log("Subscribe response status:", subscribeResponse.status)

      const subscribeResponseText = await subscribeResponse.text()
      console.log("Subscribe response body:", subscribeResponseText)

      let subscribeResponseData = null
      try {
        if (subscribeResponseText) {
          subscribeResponseData = JSON.parse(subscribeResponseText)
        }
      } catch (e) {
        console.error("Error parsing subscribe response:", e)
      }

      if (!subscribeResponse.ok) {
        return {
          success: false,
          message: "Failed to subscribe. Please try again later.",
          debug: {
            status: subscribeResponse.status,
            responseText: subscribeResponseText,
            responseData: subscribeResponseData,
            requestData: subscribeData,
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
