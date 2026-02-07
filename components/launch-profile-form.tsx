"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { LAUNCH_SITES, INCLINATION_PRESETS, ALTITUDE_RANGE, CORRIDOR_WIDTH_RANGE } from "@/lib/launch-data"
import type { LaunchProfile, LaunchSite } from "@/lib/types"

interface LaunchProfileFormProps {
  onSubmit: (profile: LaunchProfile) => void
  isLoading: boolean
  label?: string
}

export default function LaunchProfileForm({ onSubmit, isLoading, label }: LaunchProfileFormProps) {
  const [selectedSite, setSelectedSite] = useState<LaunchSite>(LAUNCH_SITES[0])
  const [altitude, setAltitude] = useState(550)
  const [inclination, setInclination] = useState(51.6)
  const [corridorWidth, setCorridorWidth] = useState(30)
  const [launchDate, setLaunchDate] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16)
  })

  function handleSiteChange(code: string) {
    const site = LAUNCH_SITES.find((s) => s.code === code)
    if (site) setSelectedSite(site)
  }

  function handleInclinationPreset(value: string) {
    const preset = INCLINATION_PRESETS.find((p) => p.label === value)
    if (preset) setInclination(preset.value)
  }

  function handleSubmit() {
    onSubmit({
      launchSite: selectedSite,
      targetAltitudeKm: altitude,
      inclinationDeg: inclination,
      corridorWidthKm: corridorWidth,
      launchDatetimeUtc: new Date(launchDate).toISOString(),
    })
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
          {label || "Launch Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Launch Site */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Launch Site</Label>
          <Select value={selectedSite.code} onValueChange={handleSiteChange}>
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAUNCH_SITES.map((site) => (
                <SelectItem key={site.code} value={site.code}>
                  {site.name} ({site.lat.toFixed(1)}, {site.lon.toFixed(1)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Altitude */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Target Altitude</Label>
            <span className="text-xs font-mono text-primary">{altitude} km</span>
          </div>
          <Slider
            value={[altitude]}
            onValueChange={([v]) => setAltitude(v)}
            min={ALTITUDE_RANGE.min}
            max={ALTITUDE_RANGE.max}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>{ALTITUDE_RANGE.min} km</span>
            <span>{ALTITUDE_RANGE.max} km</span>
          </div>
        </div>

        {/* Inclination */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Inclination</Label>
            <span className="text-xs font-mono text-primary">{inclination} deg</span>
          </div>
          <Select onValueChange={handleInclinationPreset}>
            <SelectTrigger className="bg-secondary/50 border-border/50 mb-1">
              <SelectValue placeholder="Choose preset..." />
            </SelectTrigger>
            <SelectContent>
              {INCLINATION_PRESETS.map((p) => (
                <SelectItem key={p.label} value={p.label}>
                  {p.label} ({p.value} deg)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Slider
            value={[inclination]}
            onValueChange={([v]) => setInclination(v)}
            min={0}
            max={180}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Corridor Width */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Corridor Width</Label>
            <span className="text-xs font-mono text-primary">{corridorWidth} km</span>
          </div>
          <Slider
            value={[corridorWidth]}
            onValueChange={([v]) => setCorridorWidth(v)}
            min={CORRIDOR_WIDTH_RANGE.min}
            max={CORRIDOR_WIDTH_RANGE.max}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>{CORRIDOR_WIDTH_RANGE.min} km</span>
            <span>{CORRIDOR_WIDTH_RANGE.max} km</span>
          </div>
        </div>

        {/* Launch Time */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Launch Window (UTC)</Label>
          <Input
            type="datetime-local"
            value={launchDate}
            onChange={(e) => setLaunchDate(e.target.value)}
            className="bg-secondary/50 border-border/50"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Computing...
            </span>
          ) : (
            "Run Assessment"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
