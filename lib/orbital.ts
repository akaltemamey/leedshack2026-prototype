// Orbital mechanics utilities for converting CelesTrak OMM data to positions

const MU = 398600.4418 // Earth gravitational parameter km³/s²
const RE = 6371.0 // Earth radius km
const TWO_PI = 2 * Math.PI

export interface OMMRecord {
  OBJECT_NAME: string
  OBJECT_ID: string
  EPOCH: string
  MEAN_MOTION: number // rev/day
  ECCENTRICITY: number
  INCLINATION: number // degrees
  RA_OF_ASC_NODE: number // degrees
  ARG_OF_PERICENTER: number // degrees
  MEAN_ANOMALY: number // degrees
  NORAD_CAT_ID: number
  BSTAR: number
  CLASSIFICATION_TYPE?: string
}

export interface SatellitePosition {
  name: string
  noradId: number
  lat: number
  lon: number
  altitudeKm: number
  inclination: number
  type: "active" | "debris" | "station" | "recent"
}

export interface DensityBandData {
  bandStart: number
  bandEnd: number
  objectCount: number
  density: number // normalized 0-1
}

// Convert mean motion (rev/day) to semi-major axis (km)
function meanMotionToSMA(meanMotion: number): number {
  const n = (meanMotion * TWO_PI) / 86400.0 // rad/s
  if (n <= 0) return RE + 400 // fallback
  return Math.pow(MU / (n * n), 1 / 3)
}

// Compute perigee and apogee altitude from SMA and eccentricity
export function computeAltitudes(meanMotion: number, eccentricity: number) {
  const a = meanMotionToSMA(meanMotion)
  const perigee = a * (1 - eccentricity) - RE
  const apogee = a * (1 + eccentricity) - RE
  const mean = a - RE
  return { perigee, apogee, mean }
}

// Solve Kepler's equation M = E - e*sin(E) for E using Newton-Raphson
function solveKepler(M: number, e: number, tol = 1e-8, maxIter = 50): number {
  let E = M // initial guess
  for (let i = 0; i < maxIter; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < tol) break
  }
  return E
}

// Convert orbital elements + time to Earth-fixed lat/lon
export function ommToPosition(
  record: OMMRecord,
  now: Date
): { lat: number; lon: number; altitudeKm: number } {
  const { MEAN_MOTION, ECCENTRICITY, INCLINATION, RA_OF_ASC_NODE, ARG_OF_PERICENTER, MEAN_ANOMALY, EPOCH } = record

  const a = meanMotionToSMA(MEAN_MOTION)
  const alt = a - RE

  // Time since epoch in seconds
  const epochDate = new Date(EPOCH)
  const dt = (now.getTime() - epochDate.getTime()) / 1000

  // Propagate mean anomaly
  const n = (MEAN_MOTION * TWO_PI) / 86400.0
  const M0 = (MEAN_ANOMALY * Math.PI) / 180
  let M = M0 + n * dt
  // Normalize M to [0, 2π]
  M = ((M % TWO_PI) + TWO_PI) % TWO_PI

  // Solve Kepler's equation
  const E = solveKepler(M, ECCENTRICITY)

  // True anomaly
  const sinV = (Math.sqrt(1 - ECCENTRICITY * ECCENTRICITY) * Math.sin(E)) / (1 - ECCENTRICITY * Math.cos(E))
  const cosV = (Math.cos(E) - ECCENTRICITY) / (1 - ECCENTRICITY * Math.cos(E))
  const v = Math.atan2(sinV, cosV)

  // Argument of latitude
  const u = ((ARG_OF_PERICENTER * Math.PI) / 180) + v

  // Inclination and RAAN in radians
  const inc = (INCLINATION * Math.PI) / 180
  const raan = (RA_OF_ASC_NODE * Math.PI) / 180

  // Position in orbital plane to ECI
  const xECI = Math.cos(u) * Math.cos(raan) - Math.sin(u) * Math.sin(raan) * Math.cos(inc)
  const yECI = Math.cos(u) * Math.sin(raan) + Math.sin(u) * Math.cos(raan) * Math.cos(inc)
  const zECI = Math.sin(u) * Math.sin(inc)

  // Earth rotation: Greenwich sidereal time approximation
  const J2000 = new Date("2000-01-01T12:00:00Z")
  const daysSinceJ2000 = (now.getTime() - J2000.getTime()) / 86400000
  const GMST = ((280.46061837 + 360.98564736629 * daysSinceJ2000) % 360) * (Math.PI / 180)

  // Rotate ECI to ECEF
  const xECEF = xECI * Math.cos(GMST) + yECI * Math.sin(GMST)
  const yECEF = -xECI * Math.sin(GMST) + yECI * Math.cos(GMST)
  const zECEF = zECI

  // ECEF to lat/lon
  const lat = Math.atan2(zECEF, Math.sqrt(xECEF * xECEF + yECEF * yECEF)) * (180 / Math.PI)
  const lon = Math.atan2(yECEF, xECEF) * (180 / Math.PI)

  return { lat, lon, altitudeKm: Math.max(alt, 100) }
}

// Compute density by altitude band from a set of OMM records
export function computeDensityBands(
  records: OMMRecord[],
  bandSize = 50,
  minAlt = 200,
  maxAlt = 1200
): DensityBandData[] {
  const bands: DensityBandData[] = []
  for (let start = minAlt; start < maxAlt; start += bandSize) {
    bands.push({ bandStart: start, bandEnd: start + bandSize, objectCount: 0, density: 0 })
  }

  for (const rec of records) {
    const { perigee, apogee } = computeAltitudes(rec.MEAN_MOTION, rec.ECCENTRICITY)
    // Object passes through all bands between perigee and apogee
    for (const band of bands) {
      if (perigee <= band.bandEnd && apogee >= band.bandStart) {
        band.objectCount++
      }
    }
  }

  // Normalize density to 0-1 range
  const maxCount = Math.max(...bands.map((b) => b.objectCount), 1)
  for (const band of bands) {
    band.density = band.objectCount / maxCount
  }

  return bands
}

// Subsample records for globe rendering (take evenly spaced subset)
export function subsampleForGlobe(
  records: OMMRecord[],
  maxPoints: number
): OMMRecord[] {
  if (records.length <= maxPoints) return records
  const step = Math.ceil(records.length / maxPoints)
  const result: OMMRecord[] = []
  for (let i = 0; i < records.length; i += step) {
    result.push(records[i])
  }
  return result
}
