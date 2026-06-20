import {
  FileText,
  Globe,
  Link2,
  NotebookPen,
  Plus,
  ScrollText,
  Upload,
} from "lucide-react"
import { AddSourceDialog } from "@/components/dialogs/AddSourceDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { DocumentType, SourceDocument } from "@/types"

const typeConfig: Record<
  DocumentType,
  { icon: typeof FileText; label: string; color: string }
> = {
  pdf: {
    icon: ScrollText,
    label: "PDF",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  article: {
    icon: FileText,
    label: "Article",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  note: {
    icon: NotebookPen,
    label: "Note",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  webpage: {
    icon: Globe,
    label: "Web",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
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
  const enabledCount = documents.filter((d) => d.enabled).length

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div>
          <h2 className="text-sm font-semibold">Sources</h2>
          <p className="text-[11px] text-muted-foreground">
            {enabledCount} of {documents.length} active
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {documents.length}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <AddSourceDialog
          trigger={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="size-3.5" />
              Add
            </Button>
          }
        />
        <AddSourceDialog
          trigger={
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Upload className="size-3.5" />
              Upload
            </Button>
          }
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 px-3 pb-4">
          {documents.map((doc) => {
            const config = typeConfig[doc.type]
            const Icon = config.icon
            const isPreviewing = selectedDocumentId === doc.id

            return (
              <div
                key={doc.id}
                className={cn(
                  "group rounded-xl border p-3 transition-all",
                  isPreviewing
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : doc.enabled
                      ? "border-border/60 bg-background hover:border-primary/25 hover:shadow-sm"
                      : "border-border/40 bg-muted/30 opacity-60"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    checked={doc.enabled}
                    onCheckedChange={() => onToggleDocument(doc.id)}
                    className="mt-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onSelectDocument(isPreviewing ? null : doc.id)
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "flex size-6 items-center justify-center rounded-md",
                            config.color
                          )}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px] font-normal"
                        >
                          {config.label}
                        </Badge>
                      </div>
                      {isPreviewing && (
                        <Link2 className="size-3 text-primary" />
                      )}
                    </div>
                    <p className="text-sm font-medium leading-snug">
                      {doc.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {doc.description}
                    </p>
                    {doc.pageCount && (
                      <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                        {doc.pageCount} pages
                      </p>
                    )}
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
