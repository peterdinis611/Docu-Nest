"use client"

import { useState } from "react"
import { Headphones, Pause, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioOverviewViewProps {
  notebookTitle: string
  duration: string
  summary: string
  segments: Array<{
    id: string
    speaker: "host-a" | "host-b"
    text: string
  }>
}

export function AudioOverviewView({
  notebookTitle,
  duration,
  summary,
  segments,
}: AudioOverviewViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const activeSegment = segments[activeIndex]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-background">
        <div className="border-b border-border/60 p-5 lg:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <Headphones className="size-5" />
            </div>
            <Badge variant="outline" className="h-6 px-2 text-[10px] font-normal">
              Audio overview
            </Badge>
            <Badge variant="secondary" className="h-6 px-2 text-xs tabular-nums">
              {duration}
            </Badge>
          </div>
          <h2 className="text-lg font-semibold">{notebookTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>

        <div className="flex items-center gap-4 p-5 lg:p-6">
          <Button
            size="icon"
            className="size-12 shrink-0 rounded-full"
            onClick={() => setIsPlaying((value) => !value)}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </Button>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{
                  width: `${segments.length > 0 ? ((activeIndex + 1) / segments.length) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Segment {segments.length > 0 ? activeIndex + 1 : 0} of {segments.length}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Transcript</h3>
        <div className="space-y-2">
          {segments.map((segment, index) => {
            const isActive = index === activeIndex
            const isHostA = segment.speaker === "host-a"

            return (
              <button
                key={segment.id}
                type="button"
                onClick={() => {
                  setActiveIndex(index)
                  setIsPlaying(true)
                }}
                className={cn(
                  "flex w-full gap-3 rounded-xl border p-4 text-left transition-all",
                  isActive
                    ? "border-violet-500/30 bg-violet-500/5 shadow-sm"
                    : "border-border/60 bg-card hover:border-violet-500/20"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    isHostA
                      ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                      : "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300"
                  )}
                >
                  {isHostA ? "A" : "B"}
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Host {isHostA ? "A" : "B"}
                  </p>
                  <p className="text-sm leading-relaxed">{segment.text}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
