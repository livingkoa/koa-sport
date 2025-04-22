import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasApiKey: !!process.env.KLAVIYO_API_KEY,
    hasListId: !!process.env.KLAVIYO_LIST_ID,
    apiKeyPrefix: process.env.KLAVIYO_API_KEY ? process.env.KLAVIYO_API_KEY.substring(0, 3) + "..." : null,
    listIdPrefix: process.env.KLAVIYO_LIST_ID ? process.env.KLAVIYO_LIST_ID.substring(0, 3) + "..." : null,
  })
}
