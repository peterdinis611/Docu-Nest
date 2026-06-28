"use client"

import { X } from "lucide-react"
import { BriefingDocView } from "@/components/notebook/studio/BriefingDocView"
import { MindMapView } from "@/components/notebook/studio/MindMapView"
import { Button } from "@/components/ui/button"
import { parseStudioContent } from "@/lib/studio/content"
import { MAIN_WORKSPACE_LABELS } from "@/lib/studio/workspace"
import type { StudioOutput } from "@/types"

interface StudioWorkspacePreviewProps {
  output: StudioOutput
  onClose: () => void
}

export function StudioWorkspacePreview({ output, onClose }: StudioWorkspacePreviewProps) {
  const parsed = parseStudioContent(output.content, output.type)
  const subtitle = MAIN_WORKSPACE_LABELS[output.type as keyof typeof MAIN_WORKSPACE_LABELS]

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onClose}
          aria-label={`Close ${output.title}`}
        >
          <X className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{output.title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {parsed.format === "mind-map" && (
          <MindMapView root={parsed.root} variant="expanded" />
        )}
        {parsed.format === "briefing-doc" && <BriefingDocView briefing={parsed} />}
      </div>
    </div>
  )
}
