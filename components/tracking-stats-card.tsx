"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DensityBandData } from "@/lib/orbital"

interface TrackingStatsCardProps {
  stats: {
    totalTracked: number
    activeSats: number
    debrisObjects: number
    stationObjects: number
    recentLaunches: number
    avgAltitude: number
    peakBand: string
    peakCount: number
  } | null
  densityBands: DensityBandData[]
}

export default function TrackingStatsCard({ stats, densityBands }: TrackingStatsCardProps) {
  if (!stats) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Live Orbital Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Loading CelesTrak data...</p>
        </CardContent>
      </Card>
    )
  }

  const statItems = [
    { label: "Tracked Objects", value: stats.totalTracked.toLocaleString(), color: "text-foreground" },
    { label: "Active Satellites", value: stats.activeSats.toLocaleString(), color: "text-blue-400" },
    { label: "Debris Fragments", value: stats.debrisObjects.toLocaleString(), color: "text-red-400" },
    { label: "Space Stations", value: stats.stationObjects.toString(), color: "text-foreground" },
    { label: "Recent Launches (30d)", value: stats.recentLaunches.toLocaleString(), color: "text-green-400" },
  ]

  // Top 5 density bands for the mini bar chart
  const topBands = [...densityBands].sort((a, b) => b.objectCount - a.objectCount).slice(0, 6)
  const maxCount = topBands.length > 0 ? topBands[0].objectCount : 1

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Live Orbital Tracking
          <span className="ml-auto text-[10px] font-normal text-muted-foreground/60">via CelesTrak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {statItems.map((s) => (
            <div key={s.label}>
              <div className={`text-sm font-semibold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
          <div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{stats.avgAltitude.toLocaleString()} km</div>
            <div className="text-[10px] text-muted-foreground">Avg Altitude</div>
          </div>
        </div>

        {/* Density mini chart */}
        <div>
          <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Peak Density Bands</div>
          <div className="space-y-1">
            {topBands.map((band) => (
              <div key={band.bandStart} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-[72px] text-right tabular-nums shrink-0">
                  {band.bandStart}-{band.bandEnd} km
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(band.objectCount / maxCount) * 100}%`,
                      backgroundColor: band.density > 0.7 ? "#ef4444" : band.density > 0.4 ? "#f59e0b" : "#3b82f6",
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 tabular-nums">{band.objectCount}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
