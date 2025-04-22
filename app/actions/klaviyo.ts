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

    try {
      // Step 1: Get or create profile
      const profileId = await getOrCreateProfile(email, apiKey)

      if (!profileId) {
        return {
          success: false,
          message: "Failed to find or create profile. Please try again later.",
        }
      }

      // Step 2: Subscribe the profile to the list
      const subscribeSuccess = await subscribeProfileToList(profileId, listId, apiKey)

      if (!subscribeSuccess) {
        return {
          success: false,
          message: "Failed to add to subscription list. Please try again later.",
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

// Helper function to get a profile by email or create if it doesn't exist
async function getOrCreateProfile(email: string, apiKey: string): Promise<string | null> {
  try {
    // First try to get the profile by email
    const searchUrl = `https://a.klaviyo.com/api/profiles/?filter=equals(email,"${encodeURIComponent(email)}")`

    console.log("Searching for existing profile:", searchUrl)

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Revision: "2023-10-15",
        Authorization: `Klaviyo-API-Key ${apiKey}`,
      },
    })

    console.log("Search response status:", searchResponse.status)

    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      console.log("Search response data:", JSON.stringify(searchData, null, 2))

      // If profile exists, return its ID
      if (searchData.data && searchData.data.length > 0) {
        console.log("Found existing profile with ID:", searchData.data[0].id)
        return searchData.data[0].id
      }
    }

    // If profile doesn't exist or search failed, create a new one
    console.log("Profile not found, creating new profile")

    const createProfileUrl = "https://a.klaviyo.com/api/profiles/"

    const profileData = {
      data: {
        type: "profile",
        attributes: {
          email: email,
        },
      },
    }

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

    console.log("Create profile response status:", profileResponse.status)

    if (profileResponse.ok) {
      const profileResponseData = await profileResponse.json()
      console.log("Created new profile with ID:", profileResponseData.data.id)
      return profileResponseData.data.id
    } else {
      const errorText = await profileResponse.text()
      console.error("Failed to create profile:", errorText)

      // If it's a duplicate profile error, try to search again
      // This can happen if there's a race condition or if the profile was created between our search and create
      if (profileResponse.status === 409) {
        console.log("Duplicate profile detected, searching again")

        const retrySearchResponse = await fetch(searchUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Revision: "2023-10-15",
            Authorization: `Klaviyo-API-Key ${apiKey}`,
          },
        })

        if (retrySearchResponse.ok) {
          const retrySearchData = await retrySearchResponse.json()

          if (retrySearchData.data && retrySearchData.data.length > 0) {
            console.log("Found profile on retry with ID:", retrySearchData.data[0].id)
            return retrySearchData.data[0].id
          }
        }
      }

      return null
    }
  } catch (error) {
    console.error("Error in getOrCreateProfile:", error)
    return null
  }
}

// Helper function to subscribe a profile to a list
async function subscribeProfileToList(profileId: string, listId: string, apiKey: string): Promise<boolean> {
  try {
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

    // For subscription, a 204 No Content is often returned on success
    if (subscribeResponse.ok) {
      return true
    } else {
      const errorText = await subscribeResponse.text()
      console.error("Failed to subscribe profile to list:", errorText)
      return false
    }
  } catch (error) {
    console.error("Error in subscribeProfileToList:", error)
    return false
  }
}
