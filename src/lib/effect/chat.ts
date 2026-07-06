import { Effect } from "effect"
import { updateTag } from "next/cache"
import {
  clearMessagesForNotebook,
  createChatExchangeForNotebook,
  getNotebookById,
  getSourceForNotebook,
} from "@/db/queries"
import { answerDocumentChat, answerNotebookChat } from "@/lib/ai/chat"
import { getModeConfig } from "@/lib/chat-modes"
import { cacheTags } from "@/lib/cache-tags"
import { NotFoundError } from "@/lib/effect/errors"
import { mapChatMessage, mapSourceDocument } from "@/lib/notebook-mappers"
import type { ChatMessage, InteractionMode } from "@/types"

export const sendChatMessageEffect = Effect.fn("sendChatMessage")(function* (input: {
  userId: string
  notebookId: string
  content: string
  userMessageId: string
  documentId?: string
  mode?: InteractionMode
  history: Array<{ role: "user" | "assistant"; content: string }>
}) {
  const notebook = getNotebookById(input.notebookId, input.userId)

  if (!notebook) {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Notebook", id: input.notebookId })
    )
  }

  const sources = notebook.sources.map(mapSourceDocument)
  const history = input.history.filter(
    (message) => message.content.trim().length > 0
  )

  let result: Awaited<ReturnType<typeof answerDocumentChat>>

  if (input.documentId) {
    const row = getSourceForNotebook(
      input.documentId,
      input.notebookId,
      input.userId
    )

    if (!row) {
      return yield* Effect.fail(
        new NotFoundError({ resource: "Source", id: input.documentId })
      )
    }

    const source = mapSourceDocument(row.source)

    result = yield* Effect.promise(() =>
      answerDocumentChat({
        source,
        question: input.content,
        mode: input.mode,
        history,
      })
    )
  } else {
    result = yield* Effect.promise(() =>
      answerNotebookChat({
        sources,
        question: input.content,
        mode: input.mode,
        history,
      })
    )
  }

  const assistantMessageId = crypto.randomUUID()
  const mode = input.mode ?? "qa"
  const userContent = input.content.trim() || getModeConfig(mode).label

  const exchange = createChatExchangeForNotebook(input.userId, {
    notebookId: input.notebookId,
    userMessage: {
      id: input.userMessageId,
      content: userContent,
      mode,
    },
    assistantMessage: {
      id: assistantMessageId,
      content: result.answer,
      mode,
      citations: result.citations,
    },
  })

  updateTag(cacheTags.userNotebook(input.userId, input.notebookId))
  updateTag(cacheTags.userAnalytics(input.userId))

  const assistantMessage: ChatMessage = mapChatMessage(exchange.assistantMessage)

  return { assistantMessage }
})

export const clearChatEffect = Effect.fn("clearChat")(function* (input: {
  userId: string
  notebookId: string
}) {
  const notebook = getNotebookById(input.notebookId, input.userId)

  if (!notebook) {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Notebook", id: input.notebookId })
    )
  }

  clearMessagesForNotebook(input.userId, input.notebookId)

  updateTag(cacheTags.userNotebook(input.userId, input.notebookId))
  updateTag(cacheTags.userAnalytics(input.userId))

  return { notebookId: input.notebookId }
})
