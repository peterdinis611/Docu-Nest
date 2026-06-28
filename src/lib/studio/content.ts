import type { StudioOutputType } from "@/types"
import type { StudioStructuredContent } from "./types"

export function serializeStudioContent(content: StudioStructuredContent): string {
  return JSON.stringify(content)
}

export function parseStudioContent(
  raw: string,
  type: StudioOutputType
): StudioStructuredContent {
  try {
    const parsed = JSON.parse(raw) as StudioStructuredContent
    if (
      parsed.format === "timeline" ||
      parsed.format === "mind-map" ||
      parsed.format === "flashcards" ||
      parsed.format === "briefing-doc" ||
      parsed.format === "markdown"
    ) {
      return parsed
    }
  } catch {
    // fall through to legacy markdown
  }

  if (
    type === "timeline" ||
    type === "mind-map" ||
    type === "flashcards" ||
    type === "briefing-doc"
  ) {
    return { format: "markdown", body: raw }
  }

  return { format: "markdown", body: raw }
}
