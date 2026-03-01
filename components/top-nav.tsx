"use client"

import { Button } from "@/components/ui/button"

interface TopNavProps {
  compareMode: boolean
  onToggleCompare: () => void
}

export default function TopNav({ compareMode, onToggleCompare }: TopNavProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 bg-card/60 px-4 py-3 backdrop-blur-md sm:items-center sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
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
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              Orbital Risk
            </h1>
            <p className="hidden text-[10px] uppercase tracking-wide text-muted-foreground sm:block">
              Launch Corridor Analysis System
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleCompare}
          className="text-xs"
        >
          {compareMode ? "Exit Compare" : "Compare Scenarios"}
        </Button>
        <div className="ml-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:ml-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </header>
  )
}
