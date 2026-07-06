import { StickyNote, Trash2 } from "lucide-react"
import type { SavedNote } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SavedNotesListProps {
  notes: SavedNote[]
  activeNoteId?: string | null
  onSelect?: (noteId: string) => void
  onDelete?: (noteId: string) => void
}

export function SavedNotesList({
  notes,
  activeNoteId,
  onSelect,
  onDelete,
}: SavedNotesListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Saved notes</p>
      {notes.length === 0 && (
        <p className="rounded-lg border border-dashed px-3 py-2 text-[11px] text-muted-foreground">
          Save assistant replies or studio outputs to build your notebook notes.
        </p>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          className={cn(
            "group rounded-xl border border-border/60 bg-background transition-all hover:border-primary/25 hover:shadow-sm",
            activeNoteId === note.id && "border-primary/40 bg-primary/5 shadow-sm"
          )}
        >
          <button
            type="button"
            onClick={() => onSelect?.(note.id)}
            className="w-full px-3.5 py-3 text-left"
          >
            <div className="flex items-start gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <StickyNote className="size-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{note.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {note.excerpt}
                </p>
              </div>
            </div>
          </button>
          {onDelete && (
            <div className="flex justify-end px-2 pb-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                onClick={() => onDelete(note.id)}
              >
                <Trash2 className="size-3" />
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
