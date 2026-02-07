"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AssumptionsDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-0">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Assumptions & Transparency
          </CardTitle>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </CardHeader>
      {open && (
        <CardContent className="pt-3">
          <div className="flex flex-col gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground/80 mb-1">Simplifications</p>
              <ul className="flex flex-col gap-1.5 list-disc list-inside">
                <li>No full orbital propagation is performed; risk is estimated from static density-by-altitude-band data</li>
                <li>Debris density is approximated from publicly available aggregate statistics, not individual TLE tracking</li>
                <li>Corridor geometry uses simplified great-circle arcs without Earth rotation compensation</li>
                <li>Time-of-day factor uses a simplified solar activity proxy, not actual space weather data</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground/80 mb-1">Data Sources</p>
              <ul className="flex flex-col gap-1.5 list-disc list-inside">
                <li>Debris density distribution: modeled after NASA Orbital Debris Program Office reports</li>
                <li>Orbital parameters: approximate distributions from CelesTrak catalog statistics</li>
                <li>Inclination bands: ESA DISCOS historical trend data (approximate)</li>
              </ul>
            </div>
            <p className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/30">
              This tool is for educational and planning purposes only. It does not provide certified flight safety analysis.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
