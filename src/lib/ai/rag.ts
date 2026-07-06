import "server-only"

import type { StudioOutputType } from "@/types"
import type { SourceDocument } from "@/types"
import { fileTypeLabels } from "@/lib/file-preview"
import { loadSourcesText } from "./load-source-text"
import { isAiEnabled } from "./models"
import {
  chunkSourceTexts,
  formatChunksForPrompt,
  retrieveForSources,
} from "./retrieval"

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
  const documents = await chunkSourceTexts(loaded)

  if (!isAiEnabled() || documents.length === 0) {
    return {
      sourceCount: active.length,
      contextText: buildMetadataFallback(notebookTitle, loaded),
      usedRag: false,
    }
  }

  try {
    const query = STUDIO_RETRIEVAL_QUERIES[outputType]
    const { chunks: ranked, usedRag } = await retrieveForSources(
      active,
      query,
      10
    )

    return {
      sourceCount: active.length,
      contextText: `Notebook: ${notebookTitle}

Retrieved passages (${ranked.length} of ${documents.length} chunks, query: ${outputType}):

${formatChunksForPrompt(ranked)}

Use only the passages above. Cite source titles when synthesizing.`,
      usedRag,
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
