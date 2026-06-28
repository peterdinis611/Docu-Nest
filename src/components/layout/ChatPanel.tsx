import { MessageSquare, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "@/components/notebook/ChatInput"
import { DocumentPreview } from "@/components/notebook/DocumentPreview"
import { MessageList } from "@/components/notebook/MessageList"
import { SourceGuide } from "@/components/notebook/SourceGuide"
import { SuggestedChips } from "@/components/notebook/SuggestedChips"
import type { ChatMessage, SourceDocument } from "@/types"

interface ChatPanelProps {
  documents: SourceDocument[]
  messages: ChatMessage[]
  suggestedQuestions: string[]
  sourceGuide: string
  draft: string
  isResponding: boolean
  selectedDocumentId: string | null
  onDraftChange: (draft: string) => void
  onSend: () => void
  onAskSuggested: (question: string) => void
  onClosePreview: () => void
}

export function ChatPanel({
  documents,
  messages,
  suggestedQuestions,
  sourceGuide,
  draft,
  isResponding,
  selectedDocumentId,
  onDraftChange,
  onSend,
  onAskSuggested,
  onClosePreview,
}: ChatPanelProps) {
  const previewDoc = documents.find((d) => d.id === selectedDocumentId)
  const showWelcome = messages.length === 0
  const enabledCount = documents.filter((d) => d.enabled).length

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-background">
      {previewDoc ? (
        <DocumentPreview document={previewDoc} onClose={onClosePreview} />
      ) : (
        <>
          <ScrollArea className="relative flex-1">
            {showWelcome ? (
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-muted">
                    <MessageSquare className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Chat with your sources
                    </h1>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                      Ask anything — answers are grounded exclusively in your{" "}
                      {enabledCount} selected document
                      {enabledCount !== 1 ? "s" : ""}.
                    </p>
                  </div>
                </div>

                <SourceGuide
                  guide={sourceGuide}
                  sourceCount={enabledCount}
                />

                <SuggestedChips
                  questions={suggestedQuestions}
                  onSelect={onAskSuggested}
                />

                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                  <Sparkles className="size-3" />
                  Powered by source-grounded retrieval
                </p>
              </div>
            ) : (
              <MessageList messages={messages} isResponding={isResponding} />
            )}
          </ScrollArea>

          <ChatInput
            draft={draft}
            isResponding={isResponding}
            onDraftChange={onDraftChange}
            onSend={onSend}
          />
        </>
      )}
    </main>
  )
}
