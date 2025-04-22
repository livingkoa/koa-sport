import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const apiKey = process.env.KLAVIYO_API_KEY
    const listId = process.env.KLAVIYO_LIST_ID

    if (!apiKey || !listId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing API key or list ID",
        },
        { status: 500 },
      )
    }

    // Test the Klaviyo API directly using the current API version
    const response = await fetch(`https://a.klaviyo.com/api/lists/${listId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Revision: "2023-02-22",
        Authorization: `Klaviyo-API-Key ${apiKey}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          error: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      listData: data,
    })
  } catch (error) {
    console.error("Error testing Klaviyo connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
