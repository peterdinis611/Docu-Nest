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

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-surface">
      {previewDoc ? (
        <DocumentPreview document={previewDoc} onClose={onClosePreview} />
      ) : (
        <>
          <ScrollArea className="flex-1">
            {showWelcome ? (
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
                <div className="space-y-1 text-center">
                  <h1 className="text-xl font-medium tracking-tight">
                    Chat with your sources
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Answers are grounded in selected documents only
                  </p>
                </div>

                <SourceGuide guide={sourceGuide} sourceCount={documents.filter((d) => d.enabled).length} />

                <SuggestedChips
                  questions={suggestedQuestions}
                  onSelect={onAskSuggested}
                />
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
