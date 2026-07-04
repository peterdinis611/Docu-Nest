import { FileText, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SourceDocument } from "@/types"

interface ChatFocusBannerProps {
  document: SourceDocument
  onClear: () => void
}

export function ChatFocusBanner({ document, onClear }: ChatFocusBannerProps) {
  return (
    <div className="border-b bg-muted/30 px-6 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background">
            <FileText className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Chatting with</p>
            <p className="truncate text-sm font-medium">{document.title}</p>
          </div>
          <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
            Single document
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 gap-1.5 text-xs"
          onClick={onClear}
        >
          <X className="size-3.5" />
          All sources
        </Button>
      </div>
    </div>
  )
}
