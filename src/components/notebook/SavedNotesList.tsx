import { StickyNote } from "lucide-react"
import type { SavedNote } from "@/types"

interface SavedNotesListProps {
  notes: SavedNote[]
}

export function SavedNotesList({ notes }: SavedNotesListProps) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-medium text-muted-foreground">
        Saved notes
      </p>
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          className="w-full rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
        >
          <div className="flex items-start gap-2">
            <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{note.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                {note.excerpt}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
