import { NextResponse } from "next/server"
import {
  type OMMRecord,
  ommToPosition,
  computeDensityBands,
  computeAltitudes,
  type SatellitePosition,
  type DensityBandData,
} from "@/lib/orbital"

// Cache the fetched data for 10 minutes (CelesTrak updates ~every 8 hours)
let cache: {
  data: CelestrakResponse | null
  fetchedAt: number
} = { data: null, fetchedAt: 0 }

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

interface CelestrakResponse {
  satellites: SatellitePosition[]
  densityBands: DensityBandData[]
  stats: {
    totalTracked: number
    activeSats: number
    debrisObjects: number
    stationObjects: number
    recentLaunches: number
    avgAltitude: number
    peakBand: string
    peakCount: number
  }
  lastUpdated: string
}

// Fetch a single CelesTrak group
async function fetchGroup(group: string, limit?: number): Promise<OMMRecord[]> {
  const url = new URL("https://celestrak.org/NORAD/elements/gp.php")
  url.searchParams.set("GROUP", group)
  url.searchParams.set("FORMAT", "json")
  if (limit) url.searchParams.set("LIMIT", limit.toString())

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data as OMMRecord[]
  } catch {
    return []
  }
}

async function buildCelestrakData(): Promise<CelestrakResponse> {
  const now = new Date()

  // Fetch multiple groups in parallel (no per-group LIMITs)
  const [stations, active, cosmos1408, fengyun1c, iridium33, recent] = await Promise.all([
    fetchGroup("stations"),
    fetchGroup("active"),
    fetchGroup("cosmos-1408-debris"),
    fetchGroup("1999-025"),
    fetchGroup("iridium-33-debris"),
    fetchGroup("last-30-days"),
  ])

  // Categorize and tag
  const allRecords: { record: OMMRecord; type: SatellitePosition["type"] }[] = []

  for (const r of stations) allRecords.push({ record: r, type: "station" })
  for (const r of active) allRecords.push({ record: r, type: "active" })
  for (const r of cosmos1408) allRecords.push({ record: r, type: "debris" })
  for (const r of fengyun1c) allRecords.push({ record: r, type: "debris" })
  for (const r of iridium33) allRecords.push({ record: r, type: "debris" })
  for (const r of recent) allRecords.push({ record: r, type: "recent" })

  // Deduplicate by NORAD ID
  const seen = new Set<number>()
  const unique = allRecords.filter(({ record }) => {
    if (seen.has(record.NORAD_CAT_ID)) return false
    seen.add(record.NORAD_CAT_ID)
    return true
  })

  // Compute density bands from ALL records
  const allOmm = unique.map((u) => u.record)
  const densityBands = computeDensityBands(allOmm)

  // Convert ALL unique records to positions (no subsampling)
  const satellites: SatellitePosition[] = []

  for (const { record, type } of unique) {
    try {
      const pos = ommToPosition(record, now)
      // Keep all altitudes; only skip records with invalid coordinates
      if (Number.isNaN(pos.lat) || Number.isNaN(pos.lon)) continue
      satellites.push({
        name: record.OBJECT_NAME,
        noradId: record.NORAD_CAT_ID,
        lat: pos.lat,
        lon: pos.lon,
        altitudeKm: pos.altitudeKm,
        inclination: record.INCLINATION,
        type,
      })
    } catch {
      // Skip records with bad orbital elements
    }
  }

  // Compute stats
  const debrisCount = cosmos1408.length + fengyun1c.length + iridium33.length
  const altitudes = allOmm.map((r) => computeAltitudes(r.MEAN_MOTION, r.ECCENTRICITY).mean).filter((a) => a > 0 && a < 50000)
  const avgAlt = altitudes.length > 0 ? altitudes.reduce((s, a) => s + a, 0) / altitudes.length : 0

  const peakBand = densityBands.reduce((max, b) => (b.objectCount > max.objectCount ? b : max), densityBands[0])

  return {
    satellites,
    densityBands,
    stats: {
      totalTracked: unique.length,
      activeSats: active.length,
      debrisObjects: debrisCount,
      stationObjects: stations.length,
      recentLaunches: recent.length,
      avgAltitude: Math.round(avgAlt),
      peakBand: `${peakBand.bandStart}-${peakBand.bandEnd} km`,
      peakCount: peakBand.objectCount,
    },
    lastUpdated: now.toISOString(),
  }
}

export async function GET() {
  // Check cache
  if (cache.data && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    const data = await buildCelestrakData()
    cache = { data, fetchedAt: Date.now() }
    return NextResponse.json(data)
  } catch (error) {
    // If we have stale cache, use it
    if (cache.data) {
      return NextResponse.json(cache.data)
    }
    return NextResponse.json(
      { error: "Failed to fetch CelesTrak data" },
      { status: 502 }
    )
  }
}
