import type { StudioOutputType } from "@/types"
import type { StudioStructuredContent } from "./types"

export function serializeStudioContent(content: StudioStructuredContent): string {
  return JSON.stringify(content)
}

const KNOWN_FORMATS = new Set([
  "markdown",
  "briefing-doc",
  "timeline",
  "mind-map",
  "flashcards",
  "study-guide",
  "faq",
  "audio-overview",
])

export function parseStudioContent(
  raw: string,
  type: StudioOutputType
): StudioStructuredContent {
  try {
    const parsed = JSON.parse(raw) as StudioStructuredContent
    if (KNOWN_FORMATS.has(parsed.format)) {
      return parsed
    }
  } catch {
    // fall through to legacy markdown
  }

  return { format: "markdown", body: raw }
}
