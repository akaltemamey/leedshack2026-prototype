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
    <div className="absolute bottom-4 left-4 flex gap-2 z-10">
      <button
        onClick={onToggleCorridor}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
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
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
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
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
          showSatellites
            ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
            : "bg-card/80 border-border/50 text-muted-foreground hover:text-foreground"
        )}
      >
        Satellites{satelliteCount > 0 ? ` (${satelliteCount.toLocaleString()})` : ""}
      </button>
      {showSatellites && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-border/50">
          <label className="text-xs font-medium text-muted-foreground">Opacity:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={satelliteOpacity * 100}
            onChange={(e) => onSatelliteOpacityChange(parseInt(e.target.value) / 100)}
            className="w-20 h-1.5 rounded-full cursor-pointer accent-blue-500"
          />
          <span className="text-xs text-muted-foreground w-7">{Math.round(satelliteOpacity * 100)}%</span>
        </div>
      )}
    </div>
  )
}
