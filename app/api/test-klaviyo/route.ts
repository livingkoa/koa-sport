import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.KLAVIYO_API_KEY
  const listId = process.env.KLAVIYO_LIST_ID

  // Test if we can make a simple request to Klaviyo
  let apiTest = null

  if (apiKey && listId) {
    try {
      // Try to get list info as a test
      const response = await fetch(`https://a.klaviyo.com/api/v2/list/${listId}?api_key=${apiKey}`)
      const status = response.status

      let responseData = null
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = { error: "Could not parse response as JSON" }
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
