import "server-only"

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import type { SourceRow } from "@/db/schema"
import {
  deleteChunksForSource,
  insertSourceChunks,
  updateSourceIndexing,
} from "@/db/queries"
import {
  excerptFromText,
  extractFromFileUrl,
  extractUrlText,
} from "@/lib/text-extraction"
import { getEmbeddings, isAiEnabled } from "./models"

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 900,
  chunkOverlap: 120,
})

async function resolveSourceText(source: SourceRow) {
  if (source.extractedText?.trim()) {
    return {
      text: source.extractedText,
      title: source.title,
      pageCount: source.pageCount ?? undefined,
    }
  }

  if (source.type === "webpage" && source.sourceUrl) {
    const extracted = await extractUrlText(source.sourceUrl)
    return {
      text: extracted.text,
      title: extracted.title ?? source.title,
      pageCount: undefined,
    }
  }

  if (source.fileUrl) {
    const extracted = await extractFromFileUrl(source.fileUrl, {
      mimeType: source.mimeType,
      fileName: source.originalName ?? source.title,
    })
    return {
      text: extracted.text,
      title: extracted.title ?? source.title,
      pageCount: extracted.pageCount,
    }
  }

  if (source.description.trim()) {
    return {
      text: source.description,
      title: source.title,
      pageCount: source.pageCount ?? undefined,
    }
  }

  throw new Error("No content available to index")
}

export async function indexSourceById(sourceId: string) {
  const { db } = await import("@/db/index")
  const { sources } = await import("@/db/schema")
  const { eq } = await import("drizzle-orm")

  const source = db.select().from(sources).where(eq(sources.id, sourceId)).get()

  if (!source) {
    throw new Error("Source not found")
  }

  try {
    const resolved = await resolveSourceText(source)
    const text = resolved.text.trim()

    if (!text) {
      throw new Error("Extracted text is empty")
    }

    const splits = await splitter.splitText(text)
    const chunks = splits.length > 0 ? splits : [text]

    deleteChunksForSource(sourceId)

    let embeddings: number[][] = []

    if (isAiEnabled()) {
      const embedder = getEmbeddings()
      const chunkTexts = chunks.map(
        (chunk, index) =>
          `[Source: ${resolved.title} | Chunk ${index + 1}]\n${chunk}`
      )
      embeddings = await embedder.embedDocuments(chunkTexts)
    }

    insertSourceChunks(
      chunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        sourceId,
        chunkIndex: index,
        text: chunk,
        embedding: embeddings[index] ?? null,
        sourceTitle: resolved.title ?? source.title,
      }))
    )

    updateSourceIndexing(sourceId, {
      extractedText: text,
      description: excerptFromText(text),
      pageCount: resolved.pageCount ?? source.pageCount ?? undefined,
      indexStatus: "ready",
      title: resolved.title && resolved.title !== source.title ? resolved.title : undefined,
    })

    return { sourceId, chunkCount: chunks.length, indexStatus: "ready" as const }
  } catch (error) {
    console.error("[index-source] failed for", sourceId, error)

    updateSourceIndexing(sourceId, {
      indexStatus: "failed",
    })

    throw error
  }
}
