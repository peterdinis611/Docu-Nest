import { assign, setup } from "xstate"
import {
  mockDocuments,
  mockNotebooks,
  mockSavedNotes,
  mockSourceGuide,
  mockSuggestedQuestions,
} from "@/data/mock"
import type {
  ChatMessage,
  Notebook,
  SavedNote,
  SourceDocument,
  StudioOutput,
  StudioOutputType,
} from "@/types"

export interface NotebookContext {
  notebooks: Notebook[]
  activeNotebookId: string
  documents: SourceDocument[]
  messages: ChatMessage[]
  savedNotes: SavedNote[]
  studioOutputs: StudioOutput[]
  activeStudioOutputId: string | null
  selectedDocumentId: string | null
  chatDocumentId: string | null
  suggestedQuestions: string[]
  sourceGuide: string
  draft: string
  isResponding: boolean
  generatingStudioType: StudioOutputType | null
  sourcesPanelOpen: boolean
  studioPanelOpen: boolean
}

export type NotebookEvent =
  | { type: "LOAD" }
  | {
      type: "HYDRATE_FROM_SERVER"
      notebook: Notebook
      notebooks: Notebook[]
      documents: SourceDocument[]
      messages: ChatMessage[]
      savedNotes: SavedNote[]
      studioOutputs: StudioOutput[]
    }
  | { type: "ADD_SOURCE"; source: SourceDocument }
  | { type: "SOURCE_UPDATED"; source: SourceDocument }
  | { type: "SOURCE_REMOVED"; sourceId: string }
  | { type: "NOTEBOOK_UPDATED"; notebook: Notebook }
  | { type: "SELECT_NOTEBOOK"; notebookId: string }
  | { type: "TOGGLE_DOCUMENT"; documentId: string }
  | { type: "SELECT_DOCUMENT"; documentId: string | null }
  | { type: "FOCUS_CHAT_DOCUMENT"; documentId: string }
  | { type: "CLEAR_CHAT_DOCUMENT" }
  | { type: "SET_DRAFT"; draft: string }
  | { type: "SEND_MESSAGE"; userMessageId: string }
  | { type: "ASK_SUGGESTED"; question: string; userMessageId: string }
  | { type: "MESSAGE_RESPONSE"; message: ChatMessage }
  | { type: "MESSAGE_FAILED" }
  | { type: "CLEAR_CHAT" }
  | { type: "GENERATE_STUDIO"; outputType: StudioOutputType }
  | { type: "STUDIO_OUTPUT_READY"; output: StudioOutput }
  | { type: "STUDIO_GENERATION_FAILED" }
  | { type: "SELECT_STUDIO_OUTPUT"; outputId: string | null }
  | { type: "TOGGLE_SOURCES_PANEL" }
  | { type: "TOGGLE_STUDIO_PANEL" }

export const notebookMachine = setup({
  types: {
    context: {} as NotebookContext,
    events: {} as NotebookEvent,
  },
  actions: {
    load: assign({
      notebooks: () => mockNotebooks,
      activeNotebookId: () => mockNotebooks[0].id,
      documents: () => mockDocuments,
      savedNotes: () => mockSavedNotes,
      suggestedQuestions: () => mockSuggestedQuestions,
      sourceGuide: () => mockSourceGuide,
    }),
    hydrateFromServer: assign({
      notebooks: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" ? event.notebooks : [],
      activeNotebookId: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" ? event.notebook.id : "",
      documents: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" ? event.documents : [],
      messages: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" ? event.messages : [],
      savedNotes: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" ? event.savedNotes : [],
      studioOutputs: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" ? event.studioOutputs : [],
      suggestedQuestions: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" && event.documents.length > 0
          ? mockSuggestedQuestions
          : [],
      sourceGuide: ({ event }) =>
        event.type === "HYDRATE_FROM_SERVER" && event.documents.length > 0
          ? mockSourceGuide
          : "Add sources to this notebook to start chatting with your documents.",
      selectedDocumentId: () => null,
      chatDocumentId: () => null,
      activeStudioOutputId: () => null,
      draft: () => "",
      isResponding: () => false,
      generatingStudioType: () => null,
    }),
    selectNotebook: assign({
      activeNotebookId: ({ event }) =>
        event.type === "SELECT_NOTEBOOK" ? event.notebookId : "",
      messages: () => [],
      studioOutputs: () => [],
      activeStudioOutputId: () => null,
      chatDocumentId: () => null,
    }),
    addSource: assign({
      documents: ({ context, event }) => {
        if (event.type !== "ADD_SOURCE") return context.documents
        return [event.source, ...context.documents]
      },
      sourceGuide: ({ context, event }) => {
        if (event.type !== "ADD_SOURCE") return context.sourceGuide
        if (context.documents.length > 0) return context.sourceGuide
        return mockSourceGuide
      },
      suggestedQuestions: ({ context, event }) => {
        if (event.type !== "ADD_SOURCE") return context.suggestedQuestions
        if (context.documents.length > 0) return context.suggestedQuestions
        return mockSuggestedQuestions
      },
    }),
    updateSource: assign({
      documents: ({ context, event }) => {
        if (event.type !== "SOURCE_UPDATED") return context.documents
        return context.documents.map((doc) =>
          doc.id === event.source.id ? event.source : doc
        )
      },
    }),
    removeSource: assign({
      documents: ({ context, event }) => {
        if (event.type !== "SOURCE_REMOVED") return context.documents
        return context.documents.filter((doc) => doc.id !== event.sourceId)
      },
      selectedDocumentId: ({ context, event }) => {
        if (event.type !== "SOURCE_REMOVED") return context.selectedDocumentId
        return context.selectedDocumentId === event.sourceId
          ? null
          : context.selectedDocumentId
      },
      chatDocumentId: ({ context, event }) => {
        if (event.type !== "SOURCE_REMOVED") return context.chatDocumentId
        return context.chatDocumentId === event.sourceId
          ? null
          : context.chatDocumentId
      },
    }),
    updateNotebook: assign({
      notebooks: ({ context, event }) => {
        if (event.type !== "NOTEBOOK_UPDATED") return context.notebooks
        return context.notebooks.map((notebook) =>
          notebook.id === event.notebook.id
            ? { ...notebook, ...event.notebook }
            : notebook
        )
      },
    }),
    toggleDocument: assign({
      documents: ({ context, event }) => {
        if (event.type !== "TOGGLE_DOCUMENT") return context.documents
        return context.documents.map((doc) =>
          doc.id === event.documentId
            ? { ...doc, enabled: !doc.enabled }
            : doc
        )
      },
    }),
    selectDocument: assign({
      selectedDocumentId: ({ event }) =>
        event.type === "SELECT_DOCUMENT" ? event.documentId : null,
      activeStudioOutputId: ({ context, event }) => {
        if (event.type !== "SELECT_DOCUMENT" || !event.documentId) {
          return context.activeStudioOutputId
        }
        return null
      },
    }),
    focusChatDocument: assign({
      chatDocumentId: ({ event }) =>
        event.type === "FOCUS_CHAT_DOCUMENT" ? event.documentId : null,
      selectedDocumentId: () => null,
      activeStudioOutputId: () => null,
    }),
    clearChatDocument: assign({
      chatDocumentId: () => null,
    }),
    setDraft: assign({
      draft: ({ event }) =>
        event.type === "SET_DRAFT" ? event.draft : "",
    }),
    appendUserMessage: assign({
      messages: ({ context, event }) => {
        if (event.type !== "SEND_MESSAGE") return context.messages

        const text = context.draft.trim()
        if (!text) return context.messages

        const userMessage: ChatMessage = {
          id: event.userMessageId,
          role: "user",
          content: text,
          createdAt: new Date().toISOString(),
        }

        return [...context.messages, userMessage]
      },
      draft: () => "",
      isResponding: () => true,
    }),
    askSuggested: assign({
      messages: ({ context, event }) => {
        if (event.type !== "ASK_SUGGESTED") return context.messages

        const userMessage: ChatMessage = {
          id: event.userMessageId,
          role: "user",
          content: event.question,
          createdAt: new Date().toISOString(),
        }

        return [...context.messages, userMessage]
      },
      isResponding: () => true,
    }),
    addAssistantMessage: assign({
      messages: ({ context, event }) => {
        if (event.type !== "MESSAGE_RESPONSE") return context.messages
        return [...context.messages, event.message]
      },
      isResponding: () => false,
    }),
    failMessage: assign({
      isResponding: () => false,
    }),
    clearChat: assign({
      messages: () => [],
      draft: () => "",
      isResponding: () => false,
    }),
    startStudioGeneration: assign({
      generatingStudioType: ({ event }) =>
        event.type === "GENERATE_STUDIO" ? event.outputType : null,
    }),
    addStudioOutput: assign({
      studioOutputs: ({ context, event }) => {
        if (event.type !== "STUDIO_OUTPUT_READY") return context.studioOutputs
        return [event.output, ...context.studioOutputs]
      },
      activeStudioOutputId: ({ event }) =>
        event.type === "STUDIO_OUTPUT_READY" ? event.output.id : null,
      generatingStudioType: () => null,
      selectedDocumentId: ({ context, event }) => {
        if (event.type !== "STUDIO_OUTPUT_READY") return context.selectedDocumentId
        return null
      },
    }),
    clearStudioGeneration: assign({
      generatingStudioType: () => null,
    }),
    selectStudioOutput: assign({
      activeStudioOutputId: ({ event }) =>
        event.type === "SELECT_STUDIO_OUTPUT" ? event.outputId : null,
      selectedDocumentId: ({ context, event }) => {
        if (event.type !== "SELECT_STUDIO_OUTPUT" || !event.outputId) {
          return context.selectedDocumentId
        }

        return null
      },
    }),
    toggleSourcesPanel: assign({
      sourcesPanelOpen: ({ context }) => !context.sourcesPanelOpen,
    }),
    toggleStudioPanel: assign({
      studioPanelOpen: ({ context }) => !context.studioPanelOpen,
    }),
  },
}).createMachine({
  id: "notebook",
  initial: "idle",
  context: {
    notebooks: [],
    activeNotebookId: "",
    documents: [],
    messages: [],
    savedNotes: [],
    studioOutputs: [],
    activeStudioOutputId: null,
    selectedDocumentId: null,
    chatDocumentId: null,
    suggestedQuestions: [],
    sourceGuide: "",
    draft: "",
    isResponding: false,
    generatingStudioType: null,
    sourcesPanelOpen: true,
    studioPanelOpen: true,
  },
  states: {
    idle: {
      on: {
        LOAD: { target: "ready", actions: "load" },
        HYDRATE_FROM_SERVER: { target: "ready", actions: "hydrateFromServer" },
      },
    },
    ready: {
      on: {
        HYDRATE_FROM_SERVER: { actions: "hydrateFromServer" },
        ADD_SOURCE: { actions: "addSource" },
        SOURCE_UPDATED: { actions: "updateSource" },
        SOURCE_REMOVED: { actions: "removeSource" },
        NOTEBOOK_UPDATED: { actions: "updateNotebook" },
        SELECT_NOTEBOOK: { actions: "selectNotebook" },
        TOGGLE_DOCUMENT: { actions: "toggleDocument" },
        SELECT_DOCUMENT: { actions: "selectDocument" },
        FOCUS_CHAT_DOCUMENT: { actions: "focusChatDocument" },
        CLEAR_CHAT_DOCUMENT: { actions: "clearChatDocument" },
        SET_DRAFT: { actions: "setDraft" },
        CLEAR_CHAT: { actions: "clearChat" },
        SELECT_STUDIO_OUTPUT: { actions: "selectStudioOutput" },
        TOGGLE_SOURCES_PANEL: { actions: "toggleSourcesPanel" },
        TOGGLE_STUDIO_PANEL: { actions: "toggleStudioPanel" },
        SEND_MESSAGE: {
          guard: ({ context }) => context.draft.trim().length > 0,
          actions: "appendUserMessage",
        },
        ASK_SUGGESTED: {
          actions: "askSuggested",
        },
        MESSAGE_RESPONSE: {
          actions: "addAssistantMessage",
        },
        MESSAGE_FAILED: {
          actions: "failMessage",
        },
        GENERATE_STUDIO: {
          actions: "startStudioGeneration",
        },
        STUDIO_OUTPUT_READY: {
          actions: "addStudioOutput",
        },
        STUDIO_GENERATION_FAILED: {
          actions: "clearStudioGeneration",
        },
      },
    },
  },
})
