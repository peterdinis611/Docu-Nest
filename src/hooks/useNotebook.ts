import { useCallback, useEffect, useRef } from "react"
import { useMachine } from "@xstate/react"
import { toast } from "sonner"
import { generateStudioOutputAction } from "@/actions/studio"
import { createStudioOutput } from "@/data/mock"
import { isMainWorkspaceStudioOutput } from "@/lib/studio/workspace"
import { notebookMachine } from "@/machines/notebookMachine"
import type { NotebookPageData, SourceDocument, StudioOutputType } from "@/types"

export function useNotebook(serverData?: NotebookPageData) {
  const [state, send] = useMachine(notebookMachine)
  const hydratedIdRef = useRef<string | null>(null)
  const notebookId = serverData?.notebook.id

  useEffect(() => {
    if (serverData) {
      if (hydratedIdRef.current === serverData.notebook.id) return
      hydratedIdRef.current = serverData.notebook.id

      send({
        type: "HYDRATE_FROM_SERVER",
        notebook: serverData.notebook,
        notebooks: serverData.notebooks,
        documents: serverData.documents,
        messages: serverData.messages,
        savedNotes: serverData.savedNotes,
        studioOutputs: serverData.studioOutputs,
      })
      return
    }

    if (state.matches("idle")) {
      send({ type: "LOAD" })
    }
  }, [notebookId, serverData, state, send])

  const activeNotebook = state.context.notebooks.find(
    (n) => n.id === state.context.activeNotebookId
  )

  const activeStudioOutput = state.context.studioOutputs.find(
    (o) => o.id === state.context.activeStudioOutputId
  )

  const activeMainStudioOutput = isMainWorkspaceStudioOutput(activeStudioOutput)
    ? activeStudioOutput
    : undefined

  const enabledCount = state.context.documents.filter((d) => d.enabled).length

  const generateStudio = useCallback(
    async (outputType: StudioOutputType) => {
      send({ type: "GENERATE_STUDIO", outputType })

      try {
        if (serverData?.notebook.id) {
          const result = await generateStudioOutputAction({
            notebookId: serverData.notebook.id,
            outputType,
          })

          if (result?.serverError || !result?.data?.output) {
            throw new Error("Generation failed")
          }

          send({ type: "STUDIO_OUTPUT_READY", output: result.data.output })
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 800))
        const output = createStudioOutput(
          outputType,
          state.context.documents,
          activeNotebook?.title
        )
        send({ type: "STUDIO_OUTPUT_READY", output })
      } catch {
        send({ type: "STUDIO_GENERATION_FAILED" })
        toast.error("Could not generate studio output")
      }
    },
    [
      activeNotebook?.title,
      send,
      serverData?.notebook.id,
      state.context.documents,
    ]
  )

  return {
    notebooks: state.context.notebooks,
    activeNotebook,
    documents: state.context.documents,
    messages: state.context.messages,
    savedNotes: state.context.savedNotes,
    studioOutputs: state.context.studioOutputs,
    activeStudioOutput,
    activeMainStudioOutput,
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
    addSource: (source: SourceDocument) =>
      send({ type: "ADD_SOURCE", source }),
    toggleDocument: (documentId: string) =>
      send({ type: "TOGGLE_DOCUMENT", documentId }),
    selectDocument: (documentId: string | null) =>
      send({ type: "SELECT_DOCUMENT", documentId }),
    setDraft: (draft: string) => send({ type: "SET_DRAFT", draft }),
    sendMessage: () => send({ type: "SEND_MESSAGE" }),
    askSuggested: (question: string) =>
      send({ type: "ASK_SUGGESTED", question }),
    clearChat: () => send({ type: "CLEAR_CHAT" }),
    generateStudio,
    selectStudioOutput: (outputId: string | null) =>
      send({ type: "SELECT_STUDIO_OUTPUT", outputId }),
    toggleSourcesPanel: () => send({ type: "TOGGLE_SOURCES_PANEL" }),
    toggleStudioPanel: () => send({ type: "TOGGLE_STUDIO_PANEL" }),
  }
}
