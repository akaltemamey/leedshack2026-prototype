"use client"

import { Button } from "@/components/ui/button"

interface TopNavProps {
  compareMode: boolean
  onToggleCompare: () => void
}

export default function TopNav({ compareMode, onToggleCompare }: TopNavProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 text-primary"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 2L8 10h8L12 2z" fill="currentColor" opacity="0.3" />
            <path d="M12 2L8 10h8L12 2z" />
            <path d="M10 10l-2 6 4-2 4 2-2-6" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
            <path d="M12 19v3" strokeLinecap="round" />
            <path d="M10 21l2 1 2-1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              Orbital Risk
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
              Launch Corridor Analysis System
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleCompare}
          className="text-xs"
        >
          {compareMode ? "Exit Compare" : "Compare Scenarios"}
        </Button>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </header>
  )
}
