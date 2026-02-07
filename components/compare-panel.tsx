"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CompareResult } from "@/lib/types"

interface ComparePanelProps {
  result: CompareResult | null
}

export default function ComparePanel({ result }: ComparePanelProps) {
  if (!result) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Scenario Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-muted-foreground/50 text-xs">
            Configure both scenarios and run assessment to compare
          </div>
        </CardContent>
      </Card>
    )
  }

  const deltaPositive = result.deltaRisk > 0
  const deltaColor = deltaPositive ? "text-red-400" : "text-emerald-400"

  const riskColorA =
    result.scenarioA.riskLabel === "HIGH"
      ? "text-red-400"
      : result.scenarioA.riskLabel === "MEDIUM"
        ? "text-amber-400"
        : "text-emerald-400"

  const riskColorB =
    result.scenarioB.riskLabel === "HIGH"
      ? "text-red-400"
      : result.scenarioB.riskLabel === "MEDIUM"
        ? "text-amber-400"
        : "text-emerald-400"

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          Scenario Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Side by side scores */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Scenario A */}
          <div className="text-center p-3 rounded-lg bg-secondary/30 border border-primary/20">
            <p className="text-[10px] text-primary uppercase tracking-wider font-medium mb-1">Scenario A</p>
            <p className={cn("text-2xl font-bold font-mono", riskColorA)}>
              {(result.scenarioA.overallRisk * 100).toFixed(0)}
            </p>
            <p className={cn("text-[10px] font-semibold", riskColorA)}>
              {result.scenarioA.riskLabel}
            </p>
          </div>

          {/* Delta */}
          <div className="flex flex-col items-center justify-center">
            <div className={cn("text-lg font-bold font-mono", deltaColor)}>
              {deltaPositive ? "+" : ""}{result.deltaPercent}%
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn("h-5 w-5", deltaColor)}
            >
              {deltaPositive ? (
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            <p className="text-[10px] text-muted-foreground">Delta Risk</p>
          </div>

          {/* Scenario B */}
          <div className="text-center p-3 rounded-lg bg-secondary/30 border border-amber-500/20">
            <p className="text-[10px] text-amber-400 uppercase tracking-wider font-medium mb-1">Scenario B</p>
            <p className={cn("text-2xl font-bold font-mono", riskColorB)}>
              {(result.scenarioB.overallRisk * 100).toFixed(0)}
            </p>
            <p className={cn("text-[10px] font-semibold", riskColorB)}>
              {result.scenarioB.riskLabel}
            </p>
          </div>
        </div>

        {/* Reasons */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Differences</p>
          {result.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-foreground/80">{reason}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
