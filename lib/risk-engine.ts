import type {
  LaunchProfile,
  RiskAssessment,
  AltitudeBand,
  Hotspot,
  RiskDriver,
  Recommendation,
  RiskLabel,
} from "./types"
import {
  DEBRIS_DENSITY_BY_BAND,
  HIGH_DENSITY_INCLINATIONS,
  TIME_RISK_MODIFIERS,
} from "./launch-data"

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI
}

// Generate simplified corridor path (great circle arc from launch site)
function generateCorridorPath(
  lat: number,
  lon: number,
  inclination: number,
  targetAlt: number
): { lat: number; lon: number }[] {
  const points: { lat: number; lon: number }[] = []
  const numPoints = 60
  const azimuth = toRad(90 - inclination) // simplified: launch azimuth from inclination

  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints
    const distance = fraction * (targetAlt / 100) // arc length proportional to altitude
    const angularDistance = toRad(distance)
    const lat1 = toRad(lat)
    const lon1 = toRad(lon)

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(azimuth)
    )
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(azimuth) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
      )

    points.push({ lat: toDeg(lat2), lon: toDeg(lon2) })
  }

  return points
}

// Calculate corridor width factor (wider corridor = more exposure)
function corridorWidthFactor(widthKm: number): number {
  return 0.5 + (widthKm / 100) * 0.5 // normalized 0.5-1.0
}

// Calculate inclination match factor
function inclinationFactor(inclination: number): number {
  let factor = 1.0
  for (const band of HIGH_DENSITY_INCLINATIONS) {
    const diff = Math.abs(inclination - band.center)
    if (diff <= band.width) {
      const closeness = 1 - diff / band.width
      factor = Math.max(factor, 1 + (band.factor - 1) * closeness)
    }
  }
  return factor
}

// Get time-of-day modifier
function timeFactor(datetime: string): number {
  try {
    const date = new Date(datetime)
    const hour = date.getUTCHours().toString()
    return TIME_RISK_MODIFIERS[hour] ?? 1.0
  } catch {
    return 1.0
  }
}

// Core risk assessment
export function calculateRisk(profile: LaunchProfile): RiskAssessment {
  const { launchSite, targetAltitudeKm, inclinationDeg, corridorWidthKm, launchDatetimeUtc } =
    profile

  // Calculate per-band risk
  const cwFactor = corridorWidthFactor(corridorWidthKm)
  const incFactor = inclinationFactor(inclinationDeg)
  const tFactor = timeFactor(launchDatetimeUtc)

  // The launch traverses from 0 to targetAltitude, so we consider all bands up to target
  const relevantBands = DEBRIS_DENSITY_BY_BAND.filter((b) => b.bandStart < targetAltitudeKm)

  const riskByAltitude: AltitudeBand[] = relevantBands.map((band) => {
    // Higher risk for bands closer to target altitude (more time spent there)
    const altProximity =
      1 - Math.abs(targetAltitudeKm - (band.bandStart + band.bandEnd) / 2) / targetAltitudeKm
    const proximityWeight = 0.5 + altProximity * 0.5

    const rawRisk = band.density * cwFactor * incFactor * tFactor * proximityWeight
    return {
      bandStart: band.bandStart,
      bandEnd: band.bandEnd,
      risk: Math.min(rawRisk, 1),
    }
  })

  // Overall risk: weighted average of band risks
  const totalRisk =
    riskByAltitude.reduce((sum, b) => sum + b.risk, 0) / Math.max(riskByAltitude.length, 1)
  const overallRisk = Math.min(Math.max(totalRisk, 0), 1)

  // Risk label
  let riskLabel: RiskLabel = "LOW"
  if (overallRisk >= 0.6) riskLabel = "HIGH"
  else if (overallRisk >= 0.3) riskLabel = "MEDIUM"

  // Top risk drivers
  const drivers: RiskDriver[] = []

  // Find the peak density band
  const peakBand = [...riskByAltitude].sort((a, b) => b.risk - a.risk)[0]
  if (peakBand) {
    drivers.push({
      description: `High density in ${peakBand.bandStart}-${peakBand.bandEnd} km band`,
      contribution: peakBand.risk,
    })
  }

  // Check inclination factor
  const matchingIncBand = HIGH_DENSITY_INCLINATIONS.find(
    (b) => Math.abs(inclinationDeg - b.center) <= b.width
  )
  if (matchingIncBand) {
    drivers.push({
      description: `Inclination matches ${matchingIncBand.label} (${matchingIncBand.center} deg)`,
      contribution: (incFactor - 1) * 0.5,
    })
  }

  if (corridorWidthKm > 50) {
    drivers.push({
      description: `Wide corridor (${corridorWidthKm} km) increases exposure area`,
      contribution: cwFactor * 0.3,
    })
  }

  if (targetAltitudeKm >= 700 && targetAltitudeKm <= 900) {
    drivers.push({
      description: `Target altitude ${targetAltitudeKm} km is in the high-density debris shell`,
      contribution: 0.4,
    })
  }

  // Always show at least the altitude band driver, then pad with general ones
  if (drivers.length < 3) {
    drivers.push({
      description: `Traverses ${relevantBands.length} altitude bands (200-${targetAltitudeKm} km)`,
      contribution: relevantBands.length * 0.02,
    })
  }

  // Top 3 drivers
  const topDrivers = drivers.sort((a, b) => b.contribution - a.contribution).slice(0, 3)

  // Hotspots (top 5 risk bands mapped to geographic points along corridor)
  const corridorPath = generateCorridorPath(
    launchSite.lat,
    launchSite.lon,
    inclinationDeg,
    targetAltitudeKm
  )

  const sortedBands = [...riskByAltitude].sort((a, b) => b.risk - a.risk)
  const hotspots: Hotspot[] = sortedBands.slice(0, 5).map((band, i) => {
    const pathIndex = Math.min(
      Math.floor((band.bandStart / targetAltitudeKm) * corridorPath.length),
      corridorPath.length - 1
    )
    const point = corridorPath[pathIndex]
    return {
      lat: point.lat + (Math.random() - 0.5) * 2,
      lon: point.lon + (Math.random() - 0.5) * 2,
      weight: band.risk,
      label: `Debris cluster at ${band.bandStart}-${band.bandEnd} km`,
      altitudeBand: `${band.bandStart}-${band.bandEnd} km`,
    }
  })

  // Recommendations
  const recommendations: Recommendation[] = []

  // Altitude tweak
  const lowerAlt = targetAltitudeKm - 30
  if (lowerAlt >= 200) {
    const lowerBands = DEBRIS_DENSITY_BY_BAND.filter((b) => b.bandStart < lowerAlt)
    const lowerDensity = lowerBands.reduce((s, b) => s + b.density, 0) / lowerBands.length
    const currentDensity =
      relevantBands.reduce((s, b) => s + b.density, 0) / relevantBands.length
    const delta = ((currentDensity - lowerDensity) / currentDensity) * 100
    if (delta > 2) {
      recommendations.push({
        action: `Target ${lowerAlt} km instead of ${targetAltitudeKm} km`,
        benefit: `${delta.toFixed(0)}% less debris exposure`,
        delta: -Math.round(delta),
      })
    }
  }

  // Corridor width tweak
  if (corridorWidthKm > 20) {
    const narrowerWidth = Math.max(corridorWidthKm - 20, 5)
    const narrowerFactor = corridorWidthFactor(narrowerWidth)
    const delta = ((cwFactor - narrowerFactor) / cwFactor) * 100
    recommendations.push({
      action: `Reduce corridor to ${narrowerWidth} km`,
      benefit: `${delta.toFixed(0)}% smaller exposure footprint`,
      delta: -Math.round(delta),
    })
  }

  // Time shift recommendation
  const currentHour = new Date(launchDatetimeUtc).getUTCHours()
  const bestHour = Object.entries(TIME_RISK_MODIFIERS).sort(
    ([, a], [, b]) => a - b
  )[0]
  if (bestHour && parseInt(bestHour[0]) !== currentHour) {
    const hourDiff = parseInt(bestHour[0]) - currentHour
    const sign = hourDiff > 0 ? "+" : ""
    const delta = ((tFactor - bestHour[1]) / tFactor) * 100
    if (delta > 1) {
      recommendations.push({
        action: `Shift launch time ${sign}${hourDiff}h UTC`,
        benefit: `${delta.toFixed(0)}% lower solar activity risk`,
        delta: -Math.round(delta),
      })
    }
  }

  return {
    overallRisk: Math.round(overallRisk * 1000) / 1000,
    riskLabel,
    topDrivers,
    riskByAltitude,
    hotspots,
    recommendations: recommendations.slice(0, 3),
    corridorPath,
  }
}
