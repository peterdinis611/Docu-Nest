import "server-only"

import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import type { Citation, InteractionMode, SourceDocument } from "@/types"
import { getModeSystemPrompt, resolveModePrompt } from "@/lib/chat-modes"
import { getChatModel, isAiEnabled } from "./models"
import {
  formatChunksForPrompt,
  loadAndChunkSources,
  retrieveForSources,
} from "./retrieval"
import { loadSourceText } from "./load-source-text"

const chatResponseSchema = z.object({
  answer: z.string(),
  section: z.string().optional(),
})

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "{systemPrompt}"],
  [
    "human",
    `Document: {documentTitle}

Passages:
{context}

Conversation:
{history}

Request: {question}

Return a helpful response grounded in the passages.`,
  ],
])

const notebookPrompt = ChatPromptTemplate.fromMessages([
  ["system", "{systemPrompt}"],
  [
    "human",
    `Passages from notebook sources:

{context}

Conversation:
{history}

Request: {question}

Return a helpful response grounded in the passages.`,
  ],
])

function formatHistory(
  history: Array<{ role: "user" | "assistant"; content: string }>
) {
  if (history.length === 0) return "No prior messages."

  return history
    .slice(-6)
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n")
}

function buildFallbackAnswer(
  source: SourceDocument,
  question: string,
  text: string
) {
  const excerpt = text.slice(0, 600)
  return {
    answer: `Based on "${source.title}": ${excerpt}\n\n(This is a preview-based answer. Add OPENAI_API_KEY for full RAG responses.)\n\nYour request: ${question}`,
    citations: [
      {
        documentId: source.id,
        documentTitle: source.title,
      },
    ] satisfies Citation[],
  }
}

async function buildDocumentContext(
  source: SourceDocument,
  question: string
) {
  const text = (await loadSourceText(source)) ?? source.description
  const { chunks, usedRag } = await retrieveForSources([source], question, 6)

  if (chunks.length === 0) {
    return {
      contextText: text.slice(0, 4000),
      usedRag: false,
    }
  }

  return {
    contextText: formatChunksForPrompt(chunks),
    usedRag,
  }
}

export async function answerDocumentChat(input: {
  source: SourceDocument
  question: string
  mode?: InteractionMode
  history?: Array<{ role: "user" | "assistant"; content: string }>
}) {
  const { source, history = [] } = input
  const mode = input.mode ?? "qa"
  const question = resolveModePrompt(mode, input.question)
  const text = (await loadSourceText(source)) ?? source.description

  if (!isAiEnabled()) {
    return buildFallbackAnswer(source, question, text)
  }

  try {
    const { contextText } = await buildDocumentContext(source, question)
    const model = getChatModel().withStructuredOutput(chatResponseSchema)
    const chain = chatPrompt.pipe(model)

    const result = await chain.invoke({
      systemPrompt: getModeSystemPrompt(mode),
      documentTitle: source.title,
      context: contextText,
      history: formatHistory(history),
      question,
    })

    return {
      answer: result.answer,
      citations: [
        {
          documentId: source.id,
          documentTitle: source.title,
          section: result.section,
        },
      ] satisfies Citation[],
    }
  } catch (error) {
    console.error("[chat] document answer failed, using fallback:", error)
    return buildFallbackAnswer(source, question, text)
  }
}

export async function answerNotebookChat(input: {
  sources: SourceDocument[]
  question: string
  mode?: InteractionMode
  history?: Array<{ role: "user" | "assistant"; content: string }>
}) {
  const enabled = input.sources.filter((source) => source.enabled)
  const mode = input.mode ?? "qa"
  const question = resolveModePrompt(mode, input.question)

  if (enabled.length === 1) {
    return answerDocumentChat({
      source: enabled[0]!,
      question: input.question,
      mode,
      history: input.history,
    })
  }

  const { loaded } = await loadAndChunkSources(enabled)
  const fallbackSource = enabled[0]

  if (!isAiEnabled() || !fallbackSource) {
    return {
      answer: "Enable sources and add OPENAI_API_KEY to chat with your notebook.",
      citations: [] as Citation[],
    }
  }

  try {
    const { chunks } = await retrieveForSources(enabled, question, 8)
    const model = getChatModel().withStructuredOutput(chatResponseSchema)
    const chain = notebookPrompt.pipe(model)

    const result = await chain.invoke({
      systemPrompt: getModeSystemPrompt(mode),
      context: formatChunksForPrompt(chunks),
      history: formatHistory(input.history ?? []),
      question,
    })

    const citedSourceId = chunks[0]?.metadata.sourceId as string | undefined
    const citedSource = enabled.find((source) => source.id === citedSourceId)

    return {
      answer: result.answer,
      citations: citedSource
        ? [
            {
              documentId: citedSource.id,
              documentTitle: citedSource.title,
              section: result.section,
            },
          ]
        : enabled.slice(0, 2).map((source) => ({
            documentId: source.id,
            documentTitle: source.title,
          })),
    }
  } catch {
    const preview = loaded
      .map(({ source, text }) => `${source.title}: ${text.slice(0, 400)}`)
      .join("\n\n")
    return {
      answer: `Based on your active sources:\n\n${preview.slice(0, 1200)}`,
      citations: enabled.slice(0, 2).map((source) => ({
        documentId: source.id,
        documentTitle: source.title,
      })),
    }
  }
}
