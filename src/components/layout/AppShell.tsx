import { TopBar } from "@/components/layout/TopBar"
import { SourcesPanel } from "@/components/layout/SourcesPanel"
import { ChatPanel } from "@/components/layout/ChatPanel"
import { StudioPanel } from "@/components/layout/StudioPanel"
import type { useNotebook } from "@/hooks/useNotebook"
import { cn } from "@/lib/utils"

interface AppShellProps {
  notebook: ReturnType<typeof useNotebook>
}

export function AppShell({ notebook }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar
        notebook={notebook.activeNotebook}
        notebooks={notebook.notebooks}
        enabledCount={notebook.enabledCount}
        totalSources={notebook.documents.length}
        sourcesPanelOpen={notebook.sourcesPanelOpen}
        studioPanelOpen={notebook.studioPanelOpen}
        onSelectNotebook={notebook.selectNotebook}
        onToggleSources={notebook.toggleSourcesPanel}
        onToggleStudio={notebook.toggleStudioPanel}
      />

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width,margin] duration-300 ease-in-out",
            notebook.sourcesPanelOpen ? "w-72" : "w-0"
          )}
        >
          <SourcesPanel
            documents={notebook.documents}
            selectedDocumentId={notebook.selectedDocumentId}
            onToggleDocument={notebook.toggleDocument}
            onSelectDocument={notebook.selectDocument}
          />
        </div>

        <ChatPanel
          documents={notebook.documents}
          messages={notebook.messages}
          suggestedQuestions={notebook.suggestedQuestions}
          sourceGuide={notebook.sourceGuide}
          draft={notebook.draft}
          isResponding={notebook.isResponding}
          selectedDocumentId={notebook.selectedDocumentId}
          onDraftChange={notebook.setDraft}
          onSend={notebook.sendMessage}
          onAskSuggested={notebook.askSuggested}
          onClosePreview={() => notebook.selectDocument(null)}
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
            generatingStudioType={notebook.generatingStudioType}
            onGenerate={notebook.generateStudio}
            onSelectOutput={notebook.selectStudioOutput}
          />
        </div>
      </div>
    </div>
  )
}
