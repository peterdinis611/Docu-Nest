import type { KeyboardEvent } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  draft: string
  isResponding: boolean
  onDraftChange: (draft: string) => void
  onSend: () => void
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

  const hasDraft = draft.trim().length > 0

  return (
    <div className="relative shrink-0 px-6 pb-5 pt-3">
      <div className="mx-auto max-w-2xl">
        <div
          className={cn(
            "relative rounded-2xl border bg-card shadow-md transition-shadow",
            hasDraft && "shadow-lg ring-1 ring-primary/10"
          )}
        >
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your sources…"
            disabled={isResponding}
            rows={1}
            className="min-h-[56px] resize-none border-0 bg-transparent px-5 py-4 pr-14 text-sm shadow-none focus-visible:ring-0"
          />
          <Button
            size="icon"
            className={cn(
              "absolute bottom-2.5 right-2.5 size-9 rounded-xl transition-all",
              hasDraft ? "shadow-md" : "opacity-50"
            )}
            onClick={onSend}
            disabled={!hasDraft || isResponding}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-muted-foreground/80">
          DocuNest answers only from your sources — verify important details.
        </p>
      </div>
    </div>
  )
}
