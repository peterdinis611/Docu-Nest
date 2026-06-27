import { assign, setup } from "xstate"
import {
  createStudioOutput,
  getMockResponse,
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
  | { type: "SELECT_NOTEBOOK"; notebookId: string }
  | { type: "TOGGLE_DOCUMENT"; documentId: string }
  | { type: "SELECT_DOCUMENT"; documentId: string | null }
  | { type: "SET_DRAFT"; draft: string }
  | { type: "SEND_MESSAGE" }
  | { type: "ASK_SUGGESTED"; question: string }
  | { type: "CLEAR_CHAT" }
  | { type: "GENERATE_STUDIO"; outputType: StudioOutputType }
  | { type: "SELECT_STUDIO_OUTPUT"; outputId: string | null }
  | { type: "TOGGLE_SOURCES_PANEL" }
  | { type: "TOGGLE_STUDIO_PANEL" }

export const notebookMachine = setup({
  types: {
    context: {} as NotebookContext,
    events: {} as NotebookEvent,
  },
  delays: {
    responseDelay: 700,
    studioDelay: 1200,
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
    }),
    setDraft: assign({
      draft: ({ event }) =>
        event.type === "SET_DRAFT" ? event.draft : "",
    }),
    appendUserMessage: assign({
      messages: ({ context }) => {
        const text = context.draft.trim()
        if (!text) return context.messages

        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
          role: "user",
          content: event.question,
          createdAt: new Date().toISOString(),
        }

        return [...context.messages, userMessage]
      },
      isResponding: () => true,
    }),
    appendAssistantMessage: assign({
      messages: ({ context }) => {
        const lastUser = [...context.messages]
          .reverse()
          .find((m) => m.role === "user")

        if (!lastUser) return context.messages

        const response = getMockResponse(lastUser.content)
        return [...context.messages, response]
      },
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
    finishStudioGeneration: assign(({ context }) => {
      if (!context.generatingStudioType) {
        return {
          generatingStudioType: null,
        }
      }

      const output = createStudioOutput(context.generatingStudioType)

      return {
        studioOutputs: [output, ...context.studioOutputs],
        activeStudioOutputId: output.id,
        generatingStudioType: null,
      }
    }),
    selectStudioOutput: assign({
      activeStudioOutputId: ({ event }) =>
        event.type === "SELECT_STUDIO_OUTPUT" ? event.outputId : null,
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
        SELECT_NOTEBOOK: { actions: "selectNotebook" },
        TOGGLE_DOCUMENT: { actions: "toggleDocument" },
        SELECT_DOCUMENT: { actions: "selectDocument" },
        SET_DRAFT: { actions: "setDraft" },
        CLEAR_CHAT: { actions: "clearChat" },
        SELECT_STUDIO_OUTPUT: { actions: "selectStudioOutput" },
        TOGGLE_SOURCES_PANEL: { actions: "toggleSourcesPanel" },
        TOGGLE_STUDIO_PANEL: { actions: "toggleStudioPanel" },
        SEND_MESSAGE: {
          target: "responding",
          guard: ({ context }) => context.draft.trim().length > 0,
          actions: "appendUserMessage",
        },
        ASK_SUGGESTED: {
          target: "responding",
          actions: "askSuggested",
        },
        GENERATE_STUDIO: {
          target: "generatingStudio",
          actions: "startStudioGeneration",
        },
      },
    },
    responding: {
      after: {
        responseDelay: {
          target: "ready",
          actions: "appendAssistantMessage",
        },
      },
    },
    generatingStudio: {
      after: {
        studioDelay: {
          target: "ready",
          actions: "finishStudioGeneration",
        },
      },
    },
  },
})
