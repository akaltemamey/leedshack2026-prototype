"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RiskAssessment } from "@/lib/types"

interface RiskSummaryCardProps {
  result: RiskAssessment | null
}

const riskColors = {
  LOW: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", ring: "ring-emerald-500/20" },
  MEDIUM: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", ring: "ring-amber-500/20" },
  HIGH: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", ring: "ring-red-500/20" },
}

export default function RiskSummaryCard({ result }: RiskSummaryCardProps) {
  if (!result) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Risk Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
            <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 mb-2" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            <p className="text-xs">Configure launch profile and run assessment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const colors = riskColors[result.riskLabel]

  return (
    <Card className={cn("border-border/50 bg-card/80 backdrop-blur-sm", colors.border)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          Risk Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn("flex items-center justify-center w-16 h-16 rounded-xl ring-2", colors.bg, colors.ring)}>
            <span className={cn("text-2xl font-bold font-mono", colors.text)}>
              {(result.overallRisk * 100).toFixed(0)}
            </span>
          </div>
          <div>
            <div className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider", colors.bg, colors.text)}>
              {result.riskLabel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall debris exposure score
            </p>
          </div>
        </div>

        {/* Risk gauge bar */}
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-700", {
              "bg-emerald-500": result.riskLabel === "LOW",
              "bg-amber-500": result.riskLabel === "MEDIUM",
              "bg-red-500": result.riskLabel === "HIGH",
            })}
            style={{ width: `${result.overallRisk * 100}%` }}
          />
          {/* Markers */}
          <div className="absolute inset-y-0 left-[30%] w-px bg-muted-foreground/20" />
          <div className="absolute inset-y-0 left-[60%] w-px bg-muted-foreground/20" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/60 mb-4">
          <span>LOW</span>
          <span>MEDIUM</span>
          <span>HIGH</span>
        </div>

        {/* Top drivers */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Risk Drivers</p>
          {result.topDrivers.map((driver, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full shrink-0", {
                "bg-red-400": i === 0,
                "bg-amber-400": i === 1,
                "bg-muted-foreground": i === 2,
              })} />
              <span className="text-foreground/80">{driver.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
