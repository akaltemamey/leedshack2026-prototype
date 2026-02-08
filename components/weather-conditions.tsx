"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface WeatherData {
  site_name: string
  target_time: string
}

interface WeatherConditionsProps {
  launchSite?: string
  launchWindow?: string
  onWeatherDataChange: (data: WeatherData) => void
}

// Available launch sites from the Python model
const AVAILABLE_SITES = [
  { value: "Cape_Canaveral", label: "Cape Canaveral (28.39°N, 80.61°W)" },
  { value: "Vandenberg", label: "Vandenberg (34.74°N, 120.57°W)" },
  { value: "Baikonur", label: "Baikonur (45.96°N, 63.31°E)" },
  { value: "Kourou", label: "Kourou (5.24°N, 52.78°W)" },
]

export default function WeatherConditions({
  launchSite = "Cape_Canaveral",
  launchWindow = new Date().toISOString().slice(0, 16),
  onWeatherDataChange,
}: WeatherConditionsProps) {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    site_name: launchSite,
    target_time: launchWindow,
  })

  useEffect(() => {
    onWeatherDataChange(weatherData)
  }, [weatherData, onWeatherDataChange])

  const handleSiteChange = (value: string) => {
    const updated = { ...weatherData, site_name: value }
    setWeatherData(updated)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...weatherData, target_time: e.target.value }
    setWeatherData(updated)
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wide uppercase text-muted-foreground">
          <span className="text-cyan-400">🌤️</span>
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weather-site" className="text-xs font-medium text-muted-foreground">
            Launch Site
          </Label>
          <Select value={weatherData.site_name} onValueChange={handleSiteChange}>
            <SelectTrigger id="weather-site" className="bg-secondary/30 border-border/50">
              <SelectValue placeholder="Select a launch site" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_SITES.map((site) => (
                <SelectItem key={site.value} value={site.value}>
                  {site.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select from available launch sites for accurate weather forecasting.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weather-time" className="text-xs font-medium text-muted-foreground">
            Launch Time (UTC)
          </Label>
          <Input
            id="weather-time"
            type="datetime-local"
            value={weatherData.target_time}
            onChange={handleTimeChange}
            className="bg-secondary/30 border-border/50 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Within 7 days: forecast API. Beyond 7 days: historical climatology.
          </p>
        </div>

        <div className="pt-2 border-t border-border/20">
          <p className="text-xs text-muted-foreground/70">
            Weather prediction will be fetched and factored into final risk assessment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
