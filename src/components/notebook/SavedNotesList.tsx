import { StickyNote } from "lucide-react"
import type { SavedNote } from "@/types"

interface SavedNotesListProps {
  notes: SavedNote[]
}

export function SavedNotesList({ notes }: SavedNotesListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Saved notes</p>
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-3 text-left transition-all hover:border-primary/25 hover:shadow-sm"
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
      ))}
    </div>
  )
}
