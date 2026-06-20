import { Bot, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types"

interface MessageListProps {
  messages: ChatMessage[]
  isResponding: boolean
}

export function MessageList({ messages, isResponding }: MessageListProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "user" && "flex-row-reverse"
          )}
        >
          <Avatar className="size-7 shrink-0">
            <AvatarFallback
              className={cn(
                "text-[10px]",
                message.role === "assistant"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="size-3.5" />
              ) : (
                <User className="size-3.5" />
              )}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-2",
              message.role === "user" && "items-end"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground">
              {message.role === "assistant" ? "DocuNest" : "You"}
            </span>

            <div
              className={cn(
                "max-w-[90%] text-sm leading-relaxed",
                message.role === "user"
                  ? "rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground shadow-sm"
                  : "rounded-2xl rounded-tl-md border bg-card px-4 py-3 shadow-sm"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((citation) => (
                  <Badge
                    key={`${message.id}-${citation.documentId}`}
                    variant="secondary"
                    className="cursor-pointer text-[10px] font-normal hover:bg-accent"
                  >
                    {citation.documentTitle}
                    {citation.section ? ` · ${citation.section}` : ""}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {isResponding && (
        <div className="flex gap-3">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              DocuNest
            </span>
            <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3">
              <div className="flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-muted-foreground">
                Searching sources…
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
