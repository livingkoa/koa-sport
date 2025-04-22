"use server"

import { z } from "zod"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type SubscribeResult = {
  success: boolean
  message: string
}

export async function subscribeToKlaviyoList(formData: FormData): Promise<SubscribeResult> {
  try {
    // Validate email
    const email = formData.get("email") as string
    const validatedFields = emailSchema.safeParse({ email })

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Check for required environment variables
    if (!process.env.KLAVIYO_API_KEY || !process.env.KLAVIYO_LIST_ID) {
      console.error("Missing Klaviyo environment variables")
      return {
        success: false,
        message: "Server configuration error",
      }
    }

    // Prepare the request to Klaviyo
    const klaviyoData = {
      profiles: [
        {
          email: email,
        },
      ],
    }

    // Make the request to Klaviyo API
    const response = await fetch(`https://a.klaviyo.com/api/lists/${process.env.KLAVIYO_LIST_ID}/profiles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        revision: "2023-02-22",
        Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
      },
      body: JSON.stringify(klaviyoData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Klaviyo API error:", errorData)

      // Check if the error is because the email already exists
      if (response.status === 409) {
        return {
          success: true, // Still return success to the user
          message: "You're already subscribed! We'll keep you updated.",
        }
      }

      return {
        success: false,
        message: "Failed to subscribe. Please try again later.",
      }
    }

    return {
      success: true,
      message: "Thanks for subscribing! We'll keep you updated.",
    }
  } catch (error) {
    console.error("Error subscribing to Klaviyo:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
