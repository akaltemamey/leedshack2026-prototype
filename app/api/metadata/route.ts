import { NextResponse } from "next/server"
import { LAUNCH_SITES, INCLINATION_PRESETS, DEBRIS_DENSITY_BY_BAND } from "@/lib/launch-data"

export async function GET() {
  return NextResponse.json({
    launchSites: LAUNCH_SITES,
    inclinationPresets: INCLINATION_PRESETS,
    altitudeBins: DEBRIS_DENSITY_BY_BAND.map((b) => ({
      start: b.bandStart,
      end: b.bandEnd,
    })),
    datasetTimestamp: "2026-01-15T00:00:00Z",
    dataSources: ["CelesTrak TLE (simulated)", "ESA DISCOS (approximate)", "NASA Orbital Debris Program Office"],
  })
}
