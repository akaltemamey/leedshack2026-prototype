import { NextResponse } from "next/server"
import { calculateRisk } from "@/lib/risk-engine"
import type { LaunchProfile, CompareResult } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      scenarioA: LaunchProfile
      scenarioB: LaunchProfile
    }

    if (!body.scenarioA || !body.scenarioB) {
      return NextResponse.json({ error: "Both scenarios are required" }, { status: 400 })
    }

    const resultA = calculateRisk(body.scenarioA)
    const resultB = calculateRisk(body.scenarioB)

    const deltaRisk = resultB.overallRisk - resultA.overallRisk
    const deltaPercent =
      resultA.overallRisk > 0
        ? Math.round((deltaRisk / resultA.overallRisk) * 100)
        : 0

    // Generate comparison reasons
    const reasons: string[] = []

    if (body.scenarioA.targetAltitudeKm !== body.scenarioB.targetAltitudeKm) {
      const diff = body.scenarioB.targetAltitudeKm - body.scenarioA.targetAltitudeKm
      reasons.push(
        `Altitude ${diff > 0 ? "increase" : "decrease"} of ${Math.abs(diff)} km ${diff > 0 ? "raises" : "lowers"} debris exposure`
      )
    }

    if (body.scenarioA.inclinationDeg !== body.scenarioB.inclinationDeg) {
      reasons.push(
        `Inclination change from ${body.scenarioA.inclinationDeg} to ${body.scenarioB.inclinationDeg} deg affects orbital crossing patterns`
      )
    }

    if (body.scenarioA.corridorWidthKm !== body.scenarioB.corridorWidthKm) {
      const diff = body.scenarioB.corridorWidthKm - body.scenarioA.corridorWidthKm
      reasons.push(
        `Corridor width ${diff > 0 ? "increase" : "decrease"} of ${Math.abs(diff)} km ${diff > 0 ? "expands" : "reduces"} exposure zone`
      )
    }

    if (body.scenarioA.launchSite.code !== body.scenarioB.launchSite.code) {
      reasons.push(
        `Different launch site changes the ground track and debris intersection geometry`
      )
    }

    if (reasons.length === 0) {
      reasons.push("Scenarios are identical or differ only in launch time")
    }

    const result: CompareResult = {
      scenarioA: resultA,
      scenarioB: resultB,
      deltaRisk: Math.round(deltaRisk * 1000) / 1000,
      deltaPercent,
      reasons,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Compare error:", error)
    return NextResponse.json({ error: "Failed to compare scenarios" }, { status: 500 })
  }
}
