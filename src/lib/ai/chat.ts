import "server-only"

import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import type { Citation, SourceDocument } from "@/types"
import { getChatModel, isAiEnabled } from "./models"
import {
  formatChunksForPrompt,
  loadAndChunkSources,
  retrieveRelevantChunks,
} from "./retrieval"
import { loadSourceText } from "./load-source-text"

const chatResponseSchema = z.object({
  answer: z.string(),
  section: z.string().optional(),
})

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are DocuNest, a source-grounded research assistant.
Answer ONLY using the provided document passages.
If the answer is not in the passages, say clearly that the document does not cover it.
Keep answers concise and practical.`,
  ],
  [
    "human",
    `Document: {documentTitle}

Passages:
{context}

Conversation:
{history}

Question: {question}

Return a helpful answer grounded in the passages.`,
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

function buildFallbackAnswer(source: SourceDocument, question: string, text: string) {
  const excerpt = text.slice(0, 600)
  return {
    answer: `Based on "${source.title}": ${excerpt}\n\n(This is a preview-based answer. Add OPENAI_API_KEY for full RAG responses.)\n\nYour question: ${question}`,
    citations: [
      {
        documentId: source.id,
        documentTitle: source.title,
      },
    ] satisfies Citation[],
  }
}

async function buildDocumentContext(source: SourceDocument, question: string) {
  const text = (await loadSourceText(source)) ?? source.description
  const { documents } = await loadAndChunkSources([source])

  if (documents.length === 0) {
    return {
      contextText: text.slice(0, 4000),
      usedRag: false,
    }
  }

  try {
    const { chunks, usedRag } = await retrieveRelevantChunks(documents, question, 6)
    return {
      contextText: formatChunksForPrompt(chunks),
      usedRag,
    }
  } catch {
    return {
      contextText: text.slice(0, 4000),
      usedRag: false,
    }
  }
}

export async function answerDocumentChat(input: {
  source: SourceDocument
  question: string
  history?: Array<{ role: "user" | "assistant"; content: string }>
}) {
  const { source, question, history = [] } = input
  const text = (await loadSourceText(source)) ?? source.description

  if (!isAiEnabled()) {
    return buildFallbackAnswer(source, question, text)
  }

  try {
    const { contextText } = await buildDocumentContext(source, question)
    const model = getChatModel().withStructuredOutput(chatResponseSchema)
    const chain = chatPrompt.pipe(model)

    const result = await chain.invoke({
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
  history?: Array<{ role: "user" | "assistant"; content: string }>
}) {
  const enabled = input.sources.filter((source) => source.enabled)

  if (enabled.length === 1) {
    return answerDocumentChat({
      source: enabled[0]!,
      question: input.question,
      history: input.history,
    })
  }

  const { documents, loaded } = await loadAndChunkSources(enabled)
  const fallbackSource = enabled[0]

  if (!isAiEnabled() || !fallbackSource) {
    return {
      answer: "Enable sources and add OPENAI_API_KEY to chat with your notebook.",
      citations: [] as Citation[],
    }
  }

  try {
    const { chunks } = await retrieveRelevantChunks(documents, input.question, 8)
    const model = getChatModel().withStructuredOutput(chatResponseSchema)

    const result = await model.invoke(
      `Answer using only these passages from notebook sources:\n\n${formatChunksForPrompt(chunks)}\n\nQuestion: ${input.question}`
    )

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
