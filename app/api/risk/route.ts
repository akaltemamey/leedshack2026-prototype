import { NextResponse } from "next/server"
import { calculateRisk } from "@/lib/risk-engine"
import type { LaunchProfile } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LaunchProfile

    if (
      !body.launchSite ||
      !body.targetAltitudeKm ||
      body.inclinationDeg === undefined ||
      !body.corridorWidthKm
    ) {
      return NextResponse.json({ error: "Missing required launch profile fields" }, { status: 400 })
    }

    const result = calculateRisk(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Risk calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate risk assessment" }, { status: 500 })
  }
}
