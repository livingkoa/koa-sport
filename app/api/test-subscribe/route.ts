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

    // Test email for subscription
    const testEmail = `test-${Date.now()}@example.com`

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
                  email: testEmail,
                },
              },
            ],
          },
          list_id: listId,
        },
      },
    }

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

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = responseText
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      testEmail,
      response: responseData,
      requestBody,
    })
  } catch (error) {
    console.error("Error testing Klaviyo subscription:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
