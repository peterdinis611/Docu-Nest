import { TopBar } from "@/components/layout/TopBar"
import { SourcesPanel } from "@/components/layout/SourcesPanel"
import { ChatPanel } from "@/components/layout/ChatPanel"
import { StudioPanel } from "@/components/layout/StudioPanel"
import type { useNotebook } from "@/hooks/useNotebook"
import type { ChatMessage, StudioOutput } from "@/types"
import { cn } from "@/lib/utils"

interface AppShellProps {
  notebook: ReturnType<typeof useNotebook>
}

function noteTitleFromContent(content: string, fallback = "Saved note") {
  const line = content.trim().split("\n")[0]?.trim() ?? ""
  if (!line) return fallback
  return line.length > 48 ? `${line.slice(0, 47)}…` : line
}

export function AppShell({ notebook }: AppShellProps) {
  const handleSaveMessage = (message: ChatMessage) => {
    void notebook.saveNote({
      title: noteTitleFromContent(message.content, "Chat note"),
      body: message.content,
    })
  }

  const handleSaveStudioOutput = (output: StudioOutput) => {
    void notebook.saveNote({
      title: output.title,
      body: output.content,
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar
        notebook={notebook.activeNotebook}
        notebooks={notebook.notebooks}
        enabledCount={notebook.enabledCount}
        totalSources={notebook.documents.length}
        sourcesPanelOpen={notebook.sourcesPanelOpen}
        studioPanelOpen={notebook.studioPanelOpen}
        onToggleSources={notebook.toggleSourcesPanel}
        onToggleStudio={notebook.toggleStudioPanel}
        onNotebookUpdated={notebook.updateNotebook}
      />

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width,margin] duration-300 ease-in-out",
            notebook.sourcesPanelOpen ? "w-72" : "w-0"
          )}
        >
          <SourcesPanel
            notebookId={notebook.activeNotebook?.id ?? ""}
            documents={notebook.documents}
            selectedDocumentId={notebook.selectedDocumentId}
            chatDocumentId={notebook.chatDocumentId}
            onToggleDocument={notebook.toggleDocument}
            onSelectDocument={notebook.selectDocument}
            onFocusChatDocument={notebook.focusChatDocument}
            onSourceAdded={notebook.addSource}
            onSourceUpdated={notebook.updateSource}
            onSourceDeleted={notebook.removeSource}
          />
        </div>

        <ChatPanel
          documents={notebook.documents}
          messages={notebook.messages}
          suggestedQuestions={notebook.suggestedQuestions}
          sourceGuide={notebook.sourceGuide}
          draft={notebook.draft}
          interactionMode={notebook.interactionMode}
          isResponding={notebook.isResponding}
          selectedDocumentId={notebook.selectedDocumentId}
          chatDocument={notebook.chatDocument}
          activeMainStudioOutput={notebook.activeMainStudioOutput}
          activeSavedNote={notebook.activeSavedNote}
          onDraftChange={notebook.setDraft}
          onInteractionModeChange={notebook.setInteractionMode}
          onSend={notebook.sendMessage}
          onSaveMessage={handleSaveMessage}
          onSaveStudioOutput={handleSaveStudioOutput}
          onAskSuggested={notebook.askSuggested}
          onClosePreview={() => notebook.selectDocument(null)}
          onCloseMainStudio={() => notebook.selectStudioOutput(null)}
          onCloseSavedNote={() => notebook.selectSavedNote(null)}
          onSelectDocument={notebook.selectDocument}
          onClearChatDocument={notebook.clearChatDocument}
          onFocusChatDocument={notebook.focusChatDocument}
          onClearChat={notebook.clearChat}
          notebookId={notebook.activeNotebook?.id}
          onSourceUpdated={notebook.updateSource}
          onSourceDeleted={notebook.removeSource}
        />

        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
            notebook.studioPanelOpen ? "w-80" : "w-0"
          )}
        >
          <StudioPanel
            studioOutputs={notebook.studioOutputs}
            activeStudioOutput={notebook.activeStudioOutput}
            savedNotes={notebook.savedNotes}
            activeSavedNoteId={notebook.activeSavedNoteId}
            generatingStudioType={notebook.generatingStudioType}
            enabledSourceCount={notebook.enabledCount}
            onGenerate={notebook.generateStudio}
            onSelectOutput={notebook.selectStudioOutput}
            onSelectSavedNote={(id) => notebook.selectSavedNote(id)}
            onDeleteSavedNote={(id) => void notebook.deleteSavedNote(id)}
          />
        </div>
      </div>
    </div>
  )
}
