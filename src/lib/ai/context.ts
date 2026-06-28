import "server-only"

import type { SourceDocument } from "@/types"
import { fileTypeLabels } from "@/lib/file-preview"

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
