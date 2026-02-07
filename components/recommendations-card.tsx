"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Recommendation } from "@/lib/types"

interface RecommendationsCardProps {
  recommendations: Recommendation[] | null
}

export default function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[11px]">
                {rec.delta}%
              </div>
              <div>
                <p className="font-medium text-foreground/90">{rec.action}</p>
                <p className="text-muted-foreground mt-0.5">{rec.benefit}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
