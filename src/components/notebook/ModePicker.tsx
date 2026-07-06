"use client"

import {
  AudioLines,
  GitCompare,
  GraduationCap,
  ListTree,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import type { InteractionMode } from "@/types"
import { MODE_CONFIGS } from "@/lib/chat-modes"
import { cn } from "@/lib/utils"

const iconMap = {
  qa: MessageSquare,
  summary: Sparkles,
  "deep-dive": GraduationCap,
  comparison: GitCompare,
  quiz: GraduationCap,
  outline: ListTree,
  audio: AudioLines,
} as const

interface ModePickerProps {
  value: InteractionMode
  onChange: (mode: InteractionMode) => void
  disabled?: boolean
}

export function ModePicker({ value, onChange, disabled }: ModePickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {MODE_CONFIGS.map((mode) => {
        const Icon = iconMap[mode.id]
        const isActive = value === mode.id

        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            title={mode.description}
            onClick={() => onChange(mode.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <Icon className="size-3" />
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}

export function getModePlaceholder(mode: InteractionMode) {
  return MODE_CONFIGS.find((config) => config.id === mode)?.placeholder ?? "Ask about your sources…"
}
