"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Hotspot } from "@/lib/types"

interface HotspotsListProps {
  hotspots: Hotspot[] | null
}

export default function HotspotsList({ hotspots }: HotspotsListProps) {
  if (!hotspots || hotspots.length === 0) return null

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          Debris Hotspots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {hotspots.map((spot, i) => {
            const riskPct = (spot.weight * 100).toFixed(0)
            return (
              <div
                key={i}
                className="flex items-center gap-3 text-xs p-2 rounded-lg bg-secondary/30"
              >
                <div
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-[11px]",
                    spot.weight > 0.7
                      ? "bg-red-500/15 text-red-400"
                      : spot.weight > 0.4
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-emerald-500/15 text-emerald-400"
                  )}
                >
                  {riskPct}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground/80 truncate">{spot.label}</p>
                  <p className="text-muted-foreground">
                    {spot.lat.toFixed(2)}, {spot.lon.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
