import type { SourceDocument } from "@/types"

export function getDocumentSuggestedQuestions(source: SourceDocument) {
  return [
    `What are the main points in "${source.title}"?`,
    `Summarize "${source.title}" in a few sentences.`,
    `What key terms or concepts appear in "${source.title}"?`,
    `What questions does "${source.title}" leave unanswered?`,
  ]
}
