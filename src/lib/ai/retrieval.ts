import "server-only"

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents"
import type { SourceDocument } from "@/types"
import { fileTypeLabels } from "@/lib/file-preview"
import { loadSourceText } from "./load-source-text"
import { getEmbeddings, isAiEnabled } from "./models"

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * b[i]!
    magA += a[i]! * a[i]!
    magB += b[i]! * b[i]!
  }

  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

export async function chunkSourceTexts(
  loaded: Array<{ source: SourceDocument; text: string }>
) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 900,
    chunkOverlap: 120,
  })

  const documents: Document[] = []

  for (const { source, text } of loaded) {
    const header = `[Source Id: ${source.id} | Title: ${source.title} | Type: ${fileTypeLabels[source.type]}]`
    const splits = await splitter.splitText(text)

    if (splits.length === 0) {
      documents.push(
        new Document({
          pageContent: `${header}\n${text}`,
          metadata: {
            sourceId: source.id,
            sourceTitle: source.title,
          },
        })
      )
      continue
    }

    for (const [index, chunk] of splits.entries()) {
      documents.push(
        new Document({
          pageContent: `${header}\n${chunk}`,
          metadata: {
            sourceId: source.id,
            sourceTitle: source.title,
            chunkIndex: index,
          },
        })
      )
    }
  }

  return documents
}

export async function retrieveRelevantChunks(
  documents: Document[],
  query: string,
  topK = 8
) {
  if (!isAiEnabled() || documents.length === 0) {
    return { chunks: documents.slice(0, topK), usedRag: false }
  }

  const embeddings = getEmbeddings()
  const limit = Math.min(topK, documents.length)

  const [queryVector, docVectors] = await Promise.all([
    embeddings.embedQuery(query),
    embeddings.embedDocuments(documents.map((doc) => doc.pageContent)),
  ])

  const ranked = documents
    .map((doc, index) => ({
      doc,
      score: cosineSimilarity(queryVector, docVectors[index]!),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.doc)

  return { chunks: ranked, usedRag: true }
}

export function formatChunksForPrompt(chunks: Document[]) {
  return chunks
    .map((chunk, index) => {
      const title = chunk.metadata.sourceTitle as string | undefined
      return `Passage ${index + 1}${title ? ` (${title})` : ""}:\n${chunk.pageContent}`
    })
    .join("\n\n")
}

export async function loadAndChunkSources(sources: SourceDocument[]) {
  const { loadSourcesText } = await import("./load-source-text")
  const loaded = await loadSourcesText(sources)
  const documents = await chunkSourceTexts(loaded)
  return { loaded, documents }
}
