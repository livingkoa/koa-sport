import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.KLAVIYO_API_KEY
  const listId = process.env.KLAVIYO_LIST_ID

  // Test if we can make a simple request to Klaviyo
  let apiTest = null

  if (apiKey && listId) {
    try {
      // Try to get list info using the current API version
      const response = await fetch(`https://a.klaviyo.com/api/lists/${listId}`, {
        headers: {
          Accept: "application/json",
          Revision: "2023-10-15",
          Authorization: `Klaviyo-API-Key ${apiKey}`,
        },
      })

      const status = response.status

      let responseData = null
      try {
        responseData = await response.json()
      } catch (e) {
        const responseText = await response.text()
        responseData = { error: "Could not parse response as JSON", text: responseText }
      }

      apiTest = {
        status,
        success: response.ok,
        data: responseData,
      }
    } catch (error) {
      apiTest = {
        error: error.toString(),
        success: false,
      }
    }
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasApiKey: !!apiKey,
    hasListId: !!listId,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : null,
    listIdPrefix: listId || null,
    apiTest,
  })
}
