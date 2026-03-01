"use client"

import { cn } from "@/lib/utils"

interface LayerTogglesProps {
  showCorridor: boolean
  showHotspots: boolean
  showSatellites: boolean
  satelliteCount: number
  satelliteOpacity: number
  onToggleCorridor: () => void
  onToggleHotspots: () => void
  onToggleSatellites: () => void
  onSatelliteOpacityChange: (opacity: number) => void
}

export default function LayerToggles({
  showCorridor,
  showHotspots,
  showSatellites,
  satelliteCount,
  satelliteOpacity,
  onToggleCorridor,
  onToggleHotspots,
  onToggleSatellites,
  onSatelliteOpacityChange,
}: LayerTogglesProps) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 sm:bottom-4 sm:left-4 sm:right-auto">
      <button
        onClick={onToggleCorridor}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
          showCorridor
            ? "bg-primary/20 border-primary/50 text-primary"
            : "bg-card/80 border-border/50 text-muted-foreground hover:text-foreground"
        )}
      >
        Corridor
      </button>
      <button
        onClick={onToggleHotspots}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
          showHotspots
            ? "bg-primary/20 border-primary/50 text-primary"
            : "bg-card/80 border-border/50 text-muted-foreground hover:text-foreground"
        )}
      >
        Hotspots
      </button>
      <button
        onClick={onToggleSatellites}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
          showSatellites
            ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
            : "bg-card/80 border-border/50 text-muted-foreground hover:text-foreground"
        )}
      >
        Satellites{satelliteCount > 0 ? ` (${satelliteCount.toLocaleString()})` : ""}
      </button>
      {showSatellites && (
        <div className="flex w-full items-center gap-2 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground">Opacity:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={satelliteOpacity * 100}
            onChange={(e) => onSatelliteOpacityChange(parseInt(e.target.value) / 100)}
            className="h-1.5 w-full cursor-pointer rounded-full accent-blue-500 sm:w-20"
          />
          <span className="w-7 text-xs text-muted-foreground">{Math.round(satelliteOpacity * 100)}%</span>
        </div>
      )}
    </div>
  )
}
