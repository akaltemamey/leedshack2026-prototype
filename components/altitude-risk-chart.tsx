"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import type { AltitudeBand } from "@/lib/types"

interface AltitudeRiskChartProps {
  data: AltitudeBand[] | null
  targetAltitude?: number
  compareData?: AltitudeBand[] | null
}

function getRiskColor(risk: number): string {
  if (risk >= 0.6) return "#ef4444"
  if (risk >= 0.3) return "#f59e0b"
  return "#22c55e"
}

interface ChartPayloadItem {
  name?: string
  value?: number
  payload?: {
    bandLabel: string
    risk: number
    bandStart: number
    bandEnd: number
  }
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ChartPayloadItem[]
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  if (!data) return null
  return (
    <div className="rounded-md bg-card border border-border/50 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <div className="font-medium text-foreground">{data.bandStart}-{data.bandEnd} km</div>
      <div className="text-muted-foreground mt-0.5">
        Risk: <span className="font-mono" style={{ color: getRiskColor(data.risk) }}>{(data.risk * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

export default function AltitudeRiskChart({ data, targetAltitude, compareData }: AltitudeRiskChartProps) {
  if (!data) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Risk vs Altitude
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground/50 text-xs">
            Run assessment to see altitude risk breakdown
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((band) => ({
    bandLabel: `${band.bandStart}`,
    risk: Math.round(band.risk * 1000) / 1000,
    bandStart: band.bandStart,
    bandEnd: band.bandEnd,
    compareRisk: compareData
      ? (compareData.find((b) => b.bandStart === band.bandStart)?.risk ?? 0)
      : undefined,
  }))

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          Risk vs Altitude
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="bandLabel"
                tick={{ fontSize: 9, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 1]}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(217 33% 17% / 0.5)" }} />
              {targetAltitude && (
                <ReferenceLine
                  x={`${Math.floor(targetAltitude / 50) * 50}`}
                  stroke="hsl(187 92% 52%)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{
                    value: "Target",
                    position: "top",
                    fill: "hsl(187 92% 52%)",
                    fontSize: 9,
                  }}
                />
              )}
              <Bar dataKey="risk" radius={[2, 2, 0, 0]} maxBarSize={20}>
                {chartData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={getRiskColor(entry.risk)} fillOpacity={0.8} />
                ))}
              </Bar>
              {compareData && (
                <Bar dataKey="compareRisk" radius={[2, 2, 0, 0]} maxBarSize={12} fillOpacity={0.4} fill="#f59e0b" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <span>Altitude (km)</span>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" /> LOW
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" /> MED
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-500" /> HIGH
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
