import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types"

interface MessageListProps {
  messages: ChatMessage[]
  isResponding: boolean
}

export function MessageList({ messages, isResponding }: MessageListProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col gap-2",
            message.role === "user" && "items-end"
          )}
        >
          {message.role === "assistant" && (
            <span className="text-xs font-medium text-muted-foreground">
              DocuNest
            </span>
          )}

          <div
            className={cn(
              "max-w-[90%] text-sm leading-relaxed",
              message.role === "user"
                ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground"
                : "text-foreground"
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.citations && message.citations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((citation) => (
                <button
                  key={`${message.id}-${citation.documentId}`}
                  type="button"
                  className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {citation.documentTitle}
                  {citation.section ? ` · ${citation.section}` : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {isResponding && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            DocuNest
          </span>
          <div className="flex gap-1 py-2">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  )
}
