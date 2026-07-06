import { useCallback, useEffect, useMemo, useRef } from "react"
import { useMachine } from "@xstate/react"
import { toast } from "sonner"
import { clearChatAction, sendChatMessageAction } from "@/actions/chat"
import { createSavedNoteAction, deleteSavedNoteAction } from "@/actions/saved-notes"
import {
  toggleSourceEnabledAction,
} from "@/actions/sources"
import { generateStudioOutputAction } from "@/actions/studio"
import { getMockResponse, createStudioOutput } from "@/data/mock"
import { getDocumentSuggestedQuestions } from "@/lib/chat-suggestions"
import { notebookMachine } from "@/machines/notebookMachine"
import type { NotebookPageData, Notebook, SourceDocument, StudioOutputType, InteractionMode } from "@/types"

function buildChatHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  return messages
    .slice(-10)
    .map((message) => ({ role: message.role, content: message.content }))
}

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

  const activeMainStudioOutput = activeStudioOutput

  const chatDocument = state.context.documents.find(
    (document) => document.id === state.context.chatDocumentId
  )

  const suggestedQuestions = useMemo(() => {
    if (chatDocument) {
      return getDocumentSuggestedQuestions(chatDocument)
    }

    return state.context.suggestedQuestions
  }, [chatDocument, state.context.suggestedQuestions])

  const enabledCount = state.context.documents.filter((d) => d.enabled).length

  const dispatchChatResponse = useCallback(
    async (input: {
      content: string
      userMessageId: string
      historyBeforeSend: typeof state.context.messages
    }) => {
      try {
        if (serverData?.notebook.id) {
          const result = await sendChatMessageAction({
            notebookId: serverData.notebook.id,
            content: input.content,
            userMessageId: input.userMessageId,
            documentId: state.context.chatDocumentId ?? undefined,
            mode: state.context.interactionMode,
            history: buildChatHistory(input.historyBeforeSend),
          })

          if (result?.serverError || !result?.data?.assistantMessage) {
            throw new Error("Chat failed")
          }

          send({
            type: "MESSAGE_RESPONSE",
            message: result.data.assistantMessage,
          })
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 700))
        send({
          type: "MESSAGE_RESPONSE",
          message: getMockResponse(input.content, chatDocument),
        })
      } catch {
        send({ type: "MESSAGE_FAILED" })
        toast.error("Could not get a response")
      }
    },
    [chatDocument, send, serverData?.notebook.id, state.context.chatDocumentId, state.context.interactionMode]
  )

  const sendMessage = useCallback(async () => {
    const content = state.context.draft.trim()
    const canSend =
      content.length > 0 ||
      (state.context.interactionMode !== "qa" && !state.context.isResponding)

    if (!canSend || state.context.isResponding) return

    const userMessageId = crypto.randomUUID()
    const historyBeforeSend = state.context.messages

    send({ type: "SEND_MESSAGE", userMessageId })

    await dispatchChatResponse({
      content,
      userMessageId,
      historyBeforeSend,
    })
  }, [
    dispatchChatResponse,
    send,
    state.context.draft,
    state.context.isResponding,
    state.context.messages,
    state.context.interactionMode,
  ])

  const askSuggested = useCallback(
    async (question: string) => {
      if (state.context.isResponding) return

      const userMessageId = crypto.randomUUID()
      const historyBeforeSend = state.context.messages

      send({ type: "ASK_SUGGESTED", question, userMessageId })

      await dispatchChatResponse({
        content: question,
        userMessageId,
        historyBeforeSend,
      })
    },
    [dispatchChatResponse, send, state.context.isResponding, state.context.messages]
  )

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

  const focusChatDocument = useCallback(
    (documentId: string) => {
      send({ type: "FOCUS_CHAT_DOCUMENT", documentId })
    },
    [send]
  )

  const clearChatDocument = useCallback(() => {
    send({ type: "CLEAR_CHAT_DOCUMENT" })
  }, [send])

  const toggleDocument = useCallback(
    async (documentId: string) => {
      const doc = state.context.documents.find((item) => item.id === documentId)
      if (!doc) return

      send({ type: "TOGGLE_DOCUMENT", documentId })

      if (!serverData?.notebook.id) return

      try {
        const result = await toggleSourceEnabledAction({
          notebookId: serverData.notebook.id,
          sourceId: documentId,
          enabled: !doc.enabled,
        })

        if (result?.serverError || !result?.data?.source) {
          throw new Error("Toggle failed")
        }

        send({ type: "SOURCE_UPDATED", source: result.data.source })
      } catch {
        send({ type: "TOGGLE_DOCUMENT", documentId })
        toast.error("Could not update source status")
      }
    },
    [send, serverData?.notebook.id, state.context.documents]
  )

  const updateSource = useCallback(
    (source: SourceDocument) => {
      send({ type: "SOURCE_UPDATED", source })
    },
    [send]
  )

  const removeSource = useCallback(
    (sourceId: string) => {
      send({ type: "SOURCE_REMOVED", sourceId })
    },
    [send]
  )

  const updateNotebook = useCallback(
    (notebook: Notebook) => {
      send({ type: "NOTEBOOK_UPDATED", notebook })
    },
    [send]
  )

  const clearChat = useCallback(async () => {
    send({ type: "CLEAR_CHAT" })

    if (!serverData?.notebook.id) return

    try {
      const result = await clearChatAction({
        notebookId: serverData.notebook.id,
      })

      if (result?.serverError) {
        throw new Error("Clear failed")
      }
    } catch {
      toast.error("Could not clear chat history")
    }
  }, [send, serverData?.notebook.id])

  const saveNote = useCallback(
    async (input: { title: string; body: string }) => {
      if (!serverData?.notebook.id) return

      try {
        const result = await createSavedNoteAction({
          notebookId: serverData.notebook.id,
          title: input.title,
          body: input.body,
        })

        if (result?.serverError || !result?.data?.note) {
          throw new Error("Save failed")
        }

        send({ type: "SAVED_NOTE_ADDED", note: result.data.note })
        toast.success("Saved to notes")
        return result.data.note
      } catch {
        toast.error("Could not save note")
      }
    },
    [send, serverData?.notebook.id]
  )

  const deleteSavedNote = useCallback(
    async (noteId: string) => {
      if (!serverData?.notebook.id) return

      try {
        const result = await deleteSavedNoteAction({
          notebookId: serverData.notebook.id,
          noteId,
        })

        if (result?.serverError) {
          throw new Error("Delete failed")
        }

        send({ type: "SAVED_NOTE_REMOVED", noteId })
        toast.success("Note deleted")
      } catch {
        toast.error("Could not delete note")
      }
    },
    [send, serverData?.notebook.id]
  )

  const activeSavedNote = state.context.savedNotes.find(
    (note) => note.id === state.context.activeSavedNoteId
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
    chatDocumentId: state.context.chatDocumentId,
    chatDocument,
    suggestedQuestions,
    sourceGuide: state.context.sourceGuide,
    draft: state.context.draft,
    interactionMode: state.context.interactionMode,
    isResponding: state.context.isResponding,
    activeSavedNote,
    activeSavedNoteId: state.context.activeSavedNoteId,
    generatingStudioType: state.context.generatingStudioType,
    sourcesPanelOpen: state.context.sourcesPanelOpen,
    studioPanelOpen: state.context.studioPanelOpen,
    enabledCount,
    selectNotebook: (notebookId: string) =>
      send({ type: "SELECT_NOTEBOOK", notebookId }),
    addSource: (source: SourceDocument) =>
      send({ type: "ADD_SOURCE", source }),
    toggleDocument,
    updateSource,
    removeSource,
    updateNotebook,
    selectDocument: (documentId: string | null) =>
      send({ type: "SELECT_DOCUMENT", documentId }),
    focusChatDocument,
    clearChatDocument,
    setDraft: (draft: string) => send({ type: "SET_DRAFT", draft }),
    setInteractionMode: (mode: InteractionMode) =>
      send({ type: "SET_INTERACTION_MODE", mode }),
    sendMessage,
    askSuggested,
    clearChat,
    saveNote,
    deleteSavedNote,
    selectSavedNote: (noteId: string | null) =>
      send({ type: "SELECT_SAVED_NOTE", noteId }),
    generateStudio,
    selectStudioOutput: (outputId: string | null) =>
      send({ type: "SELECT_STUDIO_OUTPUT", outputId }),
    toggleSourcesPanel: () => send({ type: "TOGGLE_SOURCES_PANEL" }),
    toggleStudioPanel: () => send({ type: "TOGGLE_STUDIO_PANEL" }),
  }
}
