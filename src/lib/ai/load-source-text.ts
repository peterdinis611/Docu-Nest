import "server-only"

import type { SourceDocument } from "@/types"

const MAX_SOURCE_CHARS = 50_000

export async function loadSourceText(source: SourceDocument) {
  if (source.extractedText?.trim()) {
    return source.extractedText.slice(0, MAX_SOURCE_CHARS)
  }

  if (!source.fileUrl) {
    return source.description || null
  }

  const { isMarkdownFile, isTextFile } = await import("@/lib/file-preview")

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
