import { useEffect } from "react"
import { useMachine } from "@xstate/react"
import { notebookMachine } from "@/machines/notebookMachine"
import type { StudioOutputType } from "@/types"

export function useNotebook() {
  const [state, send] = useMachine(notebookMachine)

  useEffect(() => {
    if (state.matches("idle")) {
      send({ type: "LOAD" })
    }
  }, [state, send])

  const activeNotebook = state.context.notebooks.find(
    (n) => n.id === state.context.activeNotebookId
  )

  const activeStudioOutput = state.context.studioOutputs.find(
    (o) => o.id === state.context.activeStudioOutputId
  )

  const enabledCount = state.context.documents.filter((d) => d.enabled).length

  return {
    notebooks: state.context.notebooks,
    activeNotebook,
    documents: state.context.documents,
    messages: state.context.messages,
    savedNotes: state.context.savedNotes,
    studioOutputs: state.context.studioOutputs,
    activeStudioOutput,
    selectedDocumentId: state.context.selectedDocumentId,
    suggestedQuestions: state.context.suggestedQuestions,
    sourceGuide: state.context.sourceGuide,
    draft: state.context.draft,
    isResponding: state.context.isResponding,
    generatingStudioType: state.context.generatingStudioType,
    sourcesPanelOpen: state.context.sourcesPanelOpen,
    studioPanelOpen: state.context.studioPanelOpen,
    enabledCount,
    selectNotebook: (notebookId: string) =>
      send({ type: "SELECT_NOTEBOOK", notebookId }),
    toggleDocument: (documentId: string) =>
      send({ type: "TOGGLE_DOCUMENT", documentId }),
    selectDocument: (documentId: string | null) =>
      send({ type: "SELECT_DOCUMENT", documentId }),
    setDraft: (draft: string) => send({ type: "SET_DRAFT", draft }),
    sendMessage: () => send({ type: "SEND_MESSAGE" }),
    askSuggested: (question: string) =>
      send({ type: "ASK_SUGGESTED", question }),
    clearChat: () => send({ type: "CLEAR_CHAT" }),
    generateStudio: (outputType: StudioOutputType) =>
      send({ type: "GENERATE_STUDIO", outputType }),
    selectStudioOutput: (outputId: string | null) =>
      send({ type: "SELECT_STUDIO_OUTPUT", outputId }),
    toggleSourcesPanel: () => send({ type: "TOGGLE_SOURCES_PANEL" }),
    toggleStudioPanel: () => send({ type: "TOGGLE_STUDIO_PANEL" }),
  }
}
