import "server-only"

import type { SourceDocument } from "@/types"
import { isMarkdownFile, isTextFile } from "@/lib/file-preview"

const MAX_SOURCE_CHARS = 50_000

export async function loadSourceText(source: SourceDocument) {
  if (!source.fileUrl) {
    return source.description || null
  }

  if (isTextFile(source) || isMarkdownFile(source)) {
    try {
      const response = await fetch(source.fileUrl)
      if (!response.ok) return source.description || null
      const text = await response.text()
      return text.slice(0, MAX_SOURCE_CHARS)
    } catch {
      return source.description || null
    }
  }

  return source.description || null
}

export async function loadSourcesText(sources: SourceDocument[]) {
  const active = sources.filter((source) => source.enabled)

  return Promise.all(
    active.map(async (source) => ({
      source,
      text: (await loadSourceText(source)) ?? source.description,
    }))
  )
}
