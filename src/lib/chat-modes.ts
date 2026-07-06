import type { InteractionMode } from "@/types"

export interface ModeConfig {
  id: InteractionMode
  label: string
  description: string
  placeholder: string
  defaultPrompt: string
}

export const MODE_CONFIGS: ModeConfig[] = [
  {
    id: "qa",
    label: "Q&A",
    description: "Ask questions grounded in your sources",
    placeholder: "Ask about your sources…",
    defaultPrompt: "Answer the question using only the provided passages.",
  },
  {
    id: "summary",
    label: "Summary",
    description: "Concise overview of key themes",
    placeholder: "Optional focus area (or leave blank for full summary)…",
    defaultPrompt:
      "Produce a clear, structured summary of the main themes, findings, and conclusions in the passages. Use short sections with bullet points where helpful.",
  },
  {
    id: "deep-dive",
    label: "Deep dive",
    description: "Detailed analysis with nuance",
    placeholder: "What should we explore in depth?…",
    defaultPrompt:
      "Provide an in-depth analysis of the topic using the passages. Explain mechanisms, implications, and supporting evidence. Note gaps or ambiguities in the sources.",
  },
  {
    id: "comparison",
    label: "Compare",
    description: "Contrast ideas across sources",
    placeholder: "What should we compare across sources?…",
    defaultPrompt:
      "Compare and contrast how the sources address the topic. Note agreements, contradictions, and unique perspectives. Format as a comparison with clear sections per source where relevant.",
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Practice questions from the material",
    placeholder: "Topic focus for quiz questions (optional)…",
    defaultPrompt:
      "Create 5–8 study quiz questions with short answers, each grounded in the passages. Format as numbered Q&A pairs.",
  },
  {
    id: "outline",
    label: "Outline",
    description: "Hierarchical structure of the content",
    placeholder: "Optional scope for the outline…",
    defaultPrompt:
      "Create a hierarchical outline of the material using headings and nested bullets (I, A, 1, a). Cover all major topics in the passages.",
  },
  {
    id: "audio",
    label: "Audio script",
    description: "Conversational script for an overview",
    placeholder: "Angle or audience for the script (optional)…",
    defaultPrompt:
      "Write a conversational two-host podcast script summarizing the passages. Alternate speakers, keep it engaging, and stay strictly grounded in the sources.",
  },
]

export function getModeConfig(mode: InteractionMode) {
  return MODE_CONFIGS.find((config) => config.id === mode) ?? MODE_CONFIGS[0]!
}

export function resolveModePrompt(mode: InteractionMode, userInput: string) {
  const config = getModeConfig(mode)
  const trimmed = userInput.trim()

  if (mode === "qa") {
    return trimmed || config.defaultPrompt
  }

  if (!trimmed) {
    return config.defaultPrompt
  }

  return `${config.defaultPrompt}\n\nUser focus: ${trimmed}`
}

export function getModeSystemPrompt(mode: InteractionMode) {
  const base =
    "You are DocuNest, a source-grounded research assistant. Answer ONLY using the provided document passages. If the answer is not in the passages, say clearly that the sources do not cover it."

  switch (mode) {
    case "summary":
      return `${base} Produce well-structured summaries without outside knowledge.`
    case "deep-dive":
      return `${base} Provide analytical depth while citing which sources support each point.`
    case "comparison":
      return `${base} Highlight agreements and contradictions across sources explicitly.`
    case "quiz":
      return `${base} Every question and answer must be directly supported by the passages.`
    case "outline":
      return `${base} Use clear hierarchical formatting suitable for study notes.`
    case "audio":
      return `${base} Write natural spoken dialogue between Host A and Host B. Prefix lines with "Host A:" or "Host B:".`
    default:
      return `${base} Keep answers concise unless depth is requested.`
  }
}
