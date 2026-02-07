"use client"

import { useState, useCallback, useEffect, Suspense, lazy } from "react"
import TopNav from "@/components/top-nav"
import LaunchProfileForm from "@/components/launch-profile-form"
import RiskSummaryCard from "@/components/risk-summary-card"
import AltitudeRiskChart from "@/components/altitude-risk-chart"
import RecommendationsCard from "@/components/recommendations-card"
import AssumptionsDrawer from "@/components/assumptions-drawer"
import HotspotsList from "@/components/hotspots-list"
import LayerToggles from "@/components/layer-toggles"
import ComparePanel from "@/components/compare-panel"
import TrackingStatsCard from "@/components/tracking-stats-card"
import type { LaunchProfile, RiskAssessment, CompareResult } from "@/lib/types"
import type { SatellitePosition, DensityBandData } from "@/lib/orbital"

const GlobeVisualization = lazy(() => import("@/components/globe-visualization"))

export default function DashboardPage() {
  // State
  const [resultA, setResultA] = useState<RiskAssessment | null>(null)
  const [resultB, setResultB] = useState<RiskAssessment | null>(null)
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null)
  const [isLoadingA, setIsLoadingA] = useState(false)
  const [isLoadingB, setIsLoadingB] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [showCorridor, setShowCorridor] = useState(true)
  const [showHotspots, setShowHotspots] = useState(true)
  const [showSatellites, setShowSatellites] = useState(true)
  const [satellites, setSatellites] = useState<SatellitePosition[]>([])
  const [celestrakStats, setCelestrakStats] = useState<{
    totalTracked: number
    activeSats: number
    debrisObjects: number
    stationObjects: number
    recentLaunches: number
    avgAltitude: number
    peakBand: string
    peakCount: number
  } | null>(null)
  const [densityBands, setDensityBands] = useState<DensityBandData[]>([])
  const [profileA, setProfileA] = useState<LaunchProfile | null>(null)
  const [profileB, setProfileB] = useState<LaunchProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch live CelesTrak satellite/debris data on mount
  useEffect(() => {
    async function fetchCelestrak() {
      try {
        const res = await fetch("/api/celestrak")
        if (!res.ok) return
        const data = await res.json()
        if (data.satellites) setSatellites(data.satellites)
        if (data.stats) setCelestrakStats(data.stats)
        if (data.densityBands) setDensityBands(data.densityBands)
      } catch {
        // Non-blocking - satellite layer is supplementary
      }
    }
    fetchCelestrak()
  }, [])

  // Single scenario assessment
  const handleRunAssessmentA = useCallback(async (profile: LaunchProfile) => {
    setIsLoadingA(true)
    setError(null)
    setProfileA(profile)

    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error("Failed to calculate risk")
      const data = (await res.json()) as RiskAssessment
      setResultA(data)

      // If compare mode and both profiles exist, run compare
      if (compareMode && profileB) {
        runCompare(profile, profileB)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setIsLoadingA(false)
    }
  }, [compareMode, profileB])

  const handleRunAssessmentB = useCallback(async (profile: LaunchProfile) => {
    setIsLoadingB(true)
    setError(null)
    setProfileB(profile)

    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error("Failed to calculate risk")
      const data = (await res.json()) as RiskAssessment
      setResultB(data)

      // Auto-compare if scenario A exists
      if (profileA) {
        runCompare(profileA, profile)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setIsLoadingB(false)
    }
  }, [profileA])

  async function runCompare(a: LaunchProfile, b: LaunchProfile) {
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioA: a, scenarioB: b }),
      })
      if (!res.ok) throw new Error("Failed to compare scenarios")
      const data = (await res.json()) as CompareResult
      setCompareResult(data)
    } catch {
      // Compare is supplementary, don't block on error
    }
  }

  function toggleCompareMode() {
    setCompareMode((prev) => {
      if (prev) {
        // Exiting compare mode - clear B
        setResultB(null)
        setProfileB(null)
        setCompareResult(null)
      }
      return !prev
    })
  }

  // Current active result for display
  const activeResult = resultA

  // Globe data
  const globeLaunchSite = profileA
    ? { lat: profileA.launchSite.lat, lon: profileA.launchSite.lon, name: profileA.launchSite.name }
    : null
  const corridorPath = activeResult?.corridorPath ?? []
  const hotspots = [
    ...(activeResult?.hotspots ?? []),
    ...(resultB?.hotspots ?? []),
  ]
  const compareCorridorPath = resultB?.corridorPath

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav compareMode={compareMode} onToggleCompare={toggleCompareMode} />

      {/* Error banner */}
      {error && (
        <div className="px-6 py-2 bg-destructive/10 border-b border-destructive/20">
          <p className="text-xs text-destructive flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: 3D Globe */}
        <div className="relative flex-1 globe-container">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading 3D Globe...
                </div>
              </div>
            }
          >
            <GlobeVisualization
              launchSite={globeLaunchSite}
              corridorPath={corridorPath}
              corridorWidth={profileA?.corridorWidthKm ?? 30}
              hotspots={hotspots}
              showCorridor={showCorridor}
              showHotspots={showHotspots}
              showSatellites={showSatellites}
              satellites={satellites}
              compareCorridorPath={compareCorridorPath}
            />
          </Suspense>
          <LayerToggles
            showCorridor={showCorridor}
            showHotspots={showHotspots}
            showSatellites={showSatellites}
            satelliteCount={satellites.length}
            onToggleCorridor={() => setShowCorridor((p) => !p)}
            onToggleHotspots={() => setShowHotspots((p) => !p)}
            onToggleSatellites={() => setShowSatellites((p) => !p)}
          />

          {/* Globe legend overlay */}
          {compareMode && resultA && resultB && (
            <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2 text-[10px] text-foreground/80 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30">
                <span className="h-2 w-4 rounded-sm bg-[#22d3ee]" /> Scenario A
              </div>
              <div className="flex items-center gap-2 text-[10px] text-foreground/80 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30">
                <span className="h-2 w-4 rounded-sm bg-[#f59e0b]" /> Scenario B
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="w-[380px] flex flex-col overflow-y-auto border-l border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col gap-3 p-4">
            {/* Compare mode: two forms side by side */}
            {compareMode ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    Scenario A
                  </span>
                </div>
                <LaunchProfileForm
                  onSubmit={handleRunAssessmentA}
                  isLoading={isLoadingA}
                  label="Scenario A"
                />
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                    Scenario B
                  </span>
                </div>
                <LaunchProfileForm
                  onSubmit={handleRunAssessmentB}
                  isLoading={isLoadingB}
                  label="Scenario B"
                />
                <ComparePanel result={compareResult} />
                {/* Side by side charts */}
                {resultA && resultB && (
                  <>
                    <AltitudeRiskChart
                      data={resultA.riskByAltitude}
                      targetAltitude={profileA?.targetAltitudeKm}
                      compareData={resultB.riskByAltitude}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <TrackingStatsCard stats={celestrakStats} densityBands={densityBands} />
                <LaunchProfileForm onSubmit={handleRunAssessmentA} isLoading={isLoadingA} />
                <RiskSummaryCard result={activeResult} />
                <AltitudeRiskChart
                  data={activeResult?.riskByAltitude ?? null}
                  targetAltitude={profileA?.targetAltitudeKm}
                />
                <HotspotsList hotspots={activeResult?.hotspots ?? null} />
                <RecommendationsCard recommendations={activeResult?.recommendations ?? null} />
              </>
            )}
            <AssumptionsDrawer />
          </div>
        </aside>
      </div>
    </div>
  )
}
