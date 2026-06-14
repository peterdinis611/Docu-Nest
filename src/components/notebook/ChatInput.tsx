import type { KeyboardEvent } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  draft: string
  isResponding: boolean
  onDraftChange: (draft: string) => void
  onSend: () => void
  onClear: () => void
}

export function ChatInput({
  draft,
  isResponding,
  onDraftChange,
  onSend,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div className="mx-auto max-w-2xl">
        <div className="relative rounded-2xl border bg-card shadow-sm">
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your sources…"
            disabled={isResponding}
            rows={1}
            className="min-h-[52px] resize-none border-0 bg-transparent px-4 py-3.5 pr-12 shadow-none focus-visible:ring-0"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 size-8 rounded-xl"
            onClick={onSend}
            disabled={!draft.trim() || isResponding}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          DocuNest can make mistakes — verify important information in your
          sources.
        </p>
      </div>
    </div>
  )
}
