"use client"

import { StickyNote, X } from "lucide-react"
import { StudioContentView } from "@/components/notebook/studio/StudioContentView"
import { Button } from "@/components/ui/button"
import { parseStudioContent } from "@/lib/studio/content"
import { MAIN_WORKSPACE_LABELS } from "@/lib/studio/workspace"
import type { StudioOutput } from "@/types"

interface StudioWorkspacePreviewProps {
  output: StudioOutput
  onClose: () => void
  onSaveNote?: () => void
}

export function StudioWorkspacePreview({
  output,
  onClose,
  onSaveNote,
}: StudioWorkspacePreviewProps) {
  const parsed = parseStudioContent(output.content, output.type)

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
          <p className="text-[11px] text-muted-foreground">
            {MAIN_WORKSPACE_LABELS[output.type]}
          </p>
        </div>
        {output.duration && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {output.duration}
          </span>
        )}
        {onSaveNote && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[11px]"
            onClick={onSaveNote}
          >
            <StickyNote className="size-3.5" />
            Save to notes
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <StudioContentView content={parsed} variant="expanded" />
      </div>
    </div>
  )
}
