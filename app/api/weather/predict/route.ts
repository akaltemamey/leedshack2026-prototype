import { NextRequest, NextResponse } from "next/server"

const WEATHER_API_URL = process.env.WEATHER_API_URL || "http://127.0.0.1:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { site_name, target_time } = body

    if (!site_name || !target_time) {
      return NextResponse.json(
        { error: "Missing site_name or target_time" },
        { status: 400 }
      )
    }

    const response = await fetch(`${WEATHER_API_URL}/predict_launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_name,
        target_time,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Weather API error (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `Weather API returned ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const prediction = await response.json()
    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Weather prediction error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch weather prediction",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
