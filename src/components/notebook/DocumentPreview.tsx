import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SourceDocument } from "@/types"

interface DocumentPreviewProps {
  document: SourceDocument
  onClose: () => void
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">{document.title}</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {document.type}
            {document.pageCount ? ` · ${document.pageCount} pages` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-4 px-6 py-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {document.description}
          </p>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm leading-7 text-foreground/80">
              [Mock preview] This is a placeholder for the full document
              content. When wired to a backend, selecting a source will show
              extracted text, page navigation, and highlight passages cited in
              chat responses.
            </p>
            <p className="mt-4 text-sm leading-7 text-foreground/80">
              Uploaded {new Date(document.uploadedAt).toLocaleDateString()}.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
