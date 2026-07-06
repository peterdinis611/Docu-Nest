"use client"

import { X } from "lucide-react"
import { MarkdownStudioView } from "@/components/notebook/studio/MarkdownStudioView"
import { Button } from "@/components/ui/button"
import type { SavedNote } from "@/types"

interface SavedNotePreviewProps {
  note: SavedNote
  onClose: () => void
}

export function SavedNotePreview({ note, onClose }: SavedNotePreviewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onClose}
          aria-label={`Close ${note.title}`}
        >
          <X className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{note.title}</p>
          <p className="text-[11px] text-muted-foreground">Saved note</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto w-full max-w-3xl">
          <MarkdownStudioView content={note.body || note.excerpt} />
        </div>
      </div>
    </div>
  )
}
