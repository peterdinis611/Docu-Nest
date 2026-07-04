import "server-only"

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents"
import type { StudioOutputType } from "@/types"
import type { SourceDocument } from "@/types"
import { fileTypeLabels } from "@/lib/file-preview"
import { loadSourcesText } from "./load-source-text"
import { getEmbeddings, isAiEnabled } from "./models"

const STUDIO_RETRIEVAL_QUERIES: Record<StudioOutputType, string> = {
  "briefing-doc":
    "Executive summary, key findings, important facts, and recommendations from the sources.",
  "study-guide":
    "Key concepts, definitions, terminology, and review-worthy material from the sources.",
  faq: "Common questions and clear answers grounded in the source material.",
  "audio-overview":
    "Main topics and conversational talking points for a podcast-style overview.",
  timeline: "Dates, events, milestones, and chronological developments in the sources.",
  "mind-map": "Core concepts, themes, and relationships between ideas in the sources.",
  flashcards: "Facts, definitions, and short question-answer pairs worth memorizing.",
}

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

async function buildDocuments(
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

function formatRetrievedChunks(chunks: Document[]) {
  return chunks
    .map((chunk, index) => {
      const title = chunk.metadata.sourceTitle as string | undefined
      return `Chunk ${index + 1}${title ? ` (${title})` : ""}:\n${chunk.pageContent}`
    })
    .join("\n\n")
}

export async function buildStudioRagContext(
  notebookTitle: string,
  sources: SourceDocument[],
  outputType: StudioOutputType
) {
  const active = sources.filter((source) => source.enabled)

  if (active.length === 0) {
    return {
      sourceCount: 0,
      contextText:
        "No active sources. The notebook has no enabled material to analyze.",
      usedRag: false,
    }
  }

  const loaded = await loadSourcesText(sources)
  const documents = await buildDocuments(loaded)

  if (!isAiEnabled() || documents.length === 0) {
    return {
      sourceCount: active.length,
      contextText: buildMetadataFallback(notebookTitle, loaded),
      usedRag: false,
    }
  }

  try {
    const embeddings = getEmbeddings()
    const query = STUDIO_RETRIEVAL_QUERIES[outputType]
    const topK = Math.min(10, documents.length)

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
      .slice(0, topK)
      .map((item) => item.doc)

    return {
      sourceCount: active.length,
      contextText: `Notebook: ${notebookTitle}

Retrieved passages (${ranked.length} of ${documents.length} chunks, query: ${outputType}):

${formatRetrievedChunks(ranked)}

Use only the passages above. Cite source titles when synthesizing.`,
      usedRag: true,
    }
  } catch (error) {
    console.error("[rag] studio retrieval failed, using metadata fallback:", error)
    return {
      sourceCount: active.length,
      contextText: buildMetadataFallback(notebookTitle, loaded),
      usedRag: false,
    }
  }
}

function buildMetadataFallback(
  notebookTitle: string,
  loaded: Array<{ source: SourceDocument; text: string }>
) {
  const body = loaded
    .map(
      ({ source, text }) =>
        `Source Id: ${source.id}
Title: ${source.title}
Type: ${fileTypeLabels[source.type]}
Content preview:
${text.slice(0, 1200)}`
    )
    .join("\n\n")

  return `Notebook: ${notebookTitle}\n\n${body}`
}

/** @deprecated Use buildStudioRagContext for AI generation. */
export function buildNotebookContext(
  notebookTitle: string,
  sources: SourceDocument[]
) {
  const active = sources.filter((source) => source.enabled)

  if (active.length === 0) {
    return {
      sourceCount: 0,
      contextText:
        "No active sources. The notebook has no enabled material to analyze.",
    }
  }

  const contextText = active
    .map(
      (source, index) =>
        `Source ${index + 1}
Id: ${source.id}
Title: ${source.title}
Type: ${fileTypeLabels[source.type]}
Description: ${source.description}`
    )
    .join("\n\n")

  return {
    sourceCount: active.length,
    contextText: `Notebook: ${notebookTitle}\n\n${contextText}`,
  }
}
