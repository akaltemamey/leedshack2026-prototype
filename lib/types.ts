export interface LaunchSite {
  name: string
  lat: number
  lon: number
  code: string
}

export interface LaunchProfile {
  launchSite: LaunchSite
  targetAltitudeKm: number
  inclinationDeg: number
  corridorWidthKm: number
  launchDatetimeUtc: string
}

export interface AltitudeBand {
  bandStart: number
  bandEnd: number
  risk: number
}

export interface Hotspot {
  lat: number
  lon: number
  weight: number
  label: string
  altitudeBand: string
}

export interface RiskDriver {
  description: string
  contribution: number
}

export interface Recommendation {
  action: string
  benefit: string
  delta: number
}

export interface RiskAssessment {
  overallRisk: number
  riskLabel: "LOW" | "MEDIUM" | "HIGH"
  topDrivers: RiskDriver[]
  riskByAltitude: AltitudeBand[]
  hotspots: Hotspot[]
  recommendations: Recommendation[]
  corridorPath: { lat: number; lon: number }[]
}

export interface CompareResult {
  scenarioA: RiskAssessment
  scenarioB: RiskAssessment
  deltaRisk: number
  deltaPercent: number
  reasons: string[]
}

export type RiskLabel = "LOW" | "MEDIUM" | "HIGH"
