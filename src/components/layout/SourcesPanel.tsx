import {
  FileText,
  Globe,
  NotebookPen,
  Plus,
  ScrollText,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { DocumentType, SourceDocument } from "@/types"

const typeIcons: Record<DocumentType, typeof FileText> = {
  pdf: ScrollText,
  article: FileText,
  note: NotebookPen,
  webpage: Globe,
}

interface SourcesPanelProps {
  documents: SourceDocument[]
  selectedDocumentId: string | null
  onToggleDocument: (id: string) => void
  onSelectDocument: (id: string | null) => void
}

export function SourcesPanel({
  documents,
  selectedDocumentId,
  onToggleDocument,
  onSelectDocument,
}: SourcesPanelProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-panel">
      <div className="px-4 py-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Sources
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <Plus className="size-3.5" />
          Add
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          <Upload className="size-3.5" />
          Upload
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {documents.map((doc) => {
            const Icon = typeIcons[doc.type]
            const isPreviewing = selectedDocumentId === doc.id

            return (
              <div
                key={doc.id}
                className={cn(
                  "group rounded-lg px-2 py-2 transition-colors",
                  isPreviewing ? "bg-accent" : "hover:bg-accent/60"
                )}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={doc.enabled}
                    onCheckedChange={() => onToggleDocument(doc.id)}
                    className="mt-0.5"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onSelectDocument(isPreviewing ? null : doc.id)
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <p className="truncate text-sm leading-tight">
                        {doc.title}
                      </p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      {doc.description}
                    </p>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
