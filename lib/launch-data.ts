import type { LaunchSite } from "./types"

export const LAUNCH_SITES: LaunchSite[] = [
  { name: "Cape Canaveral", lat: 28.3922, lon: -80.6077, code: "CC" },
  { name: "Vandenberg", lat: 34.7420, lon: -120.5724, code: "VB" },
  { name: "Baikonur", lat: 45.9650, lon: 63.3050, code: "BK" },
  { name: "Kourou", lat: 5.2360, lon: -52.7686, code: "KR" },
]

export const INCLINATION_PRESETS = [
  { label: "Equatorial", value: 0 },
  { label: "Cape Canaveral Min", value: 28.5 },
  { label: "ISS", value: 51.6 },
  { label: "Starlink", value: 53 },
  { label: "Sun-synchronous", value: 97.4 },
]

export const ALTITUDE_RANGE = { min: 200, max: 3000 }
export const CORRIDOR_WIDTH_RANGE = { min: 5, max: 100 }

// Simulated debris density by altitude band (objects per 50km band)
// Based on approximate real-world distributions from ESA/NASA data
// Peaks around 750-850km (weather/Earth observation sats) and 500-600km (Starlink region)
export const DEBRIS_DENSITY_BY_BAND: { bandStart: number; bandEnd: number; density: number }[] = [
  { bandStart: 200, bandEnd: 250, density: 0.05 },
  { bandStart: 250, bandEnd: 300, density: 0.08 },
  { bandStart: 300, bandEnd: 350, density: 0.12 },
  { bandStart: 350, bandEnd: 400, density: 0.18 },
  { bandStart: 400, bandEnd: 450, density: 0.25 },
  { bandStart: 450, bandEnd: 500, density: 0.35 },
  { bandStart: 500, bandEnd: 550, density: 0.55 },
  { bandStart: 550, bandEnd: 600, density: 0.72 },
  { bandStart: 600, bandEnd: 650, density: 0.68 },
  { bandStart: 650, bandEnd: 700, density: 0.58 },
  { bandStart: 700, bandEnd: 750, density: 0.75 },
  { bandStart: 750, bandEnd: 800, density: 0.92 },
  { bandStart: 800, bandEnd: 850, density: 0.98 },
  { bandStart: 850, bandEnd: 900, density: 0.85 },
  { bandStart: 900, bandEnd: 950, density: 0.62 },
  { bandStart: 950, bandEnd: 1000, density: 0.48 },
  { bandStart: 1000, bandEnd: 1050, density: 0.35 },
  { bandStart: 1050, bandEnd: 1100, density: 0.28 },
  { bandStart: 1100, bandEnd: 1150, density: 0.20 },
  { bandStart: 1150, bandEnd: 1200, density: 0.15 },
]

// Inclination bands with higher debris density (degrees)
export const HIGH_DENSITY_INCLINATIONS = [
  { center: 51.6, width: 5, factor: 1.3, label: "ISS corridor" },
  { center: 53, width: 3, factor: 1.2, label: "Starlink band" },
  { center: 97.4, width: 4, factor: 1.4, label: "Sun-synch corridor" },
  { center: 82, width: 6, factor: 1.1, label: "Polar orbit zone" },
]

// Time-of-day risk modifiers (simplified solar activity proxy)
export const TIME_RISK_MODIFIERS: Record<string, number> = {
  "0": 0.95, "1": 0.94, "2": 0.93, "3": 0.92,
  "4": 0.93, "5": 0.95, "6": 0.98, "7": 1.0,
  "8": 1.02, "9": 1.04, "10": 1.05, "11": 1.06,
  "12": 1.06, "13": 1.05, "14": 1.04, "15": 1.03,
  "16": 1.02, "17": 1.01, "18": 1.0, "19": 0.99,
  "20": 0.98, "21": 0.97, "22": 0.96, "23": 0.95,
}
