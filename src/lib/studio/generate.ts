import { fileTypeLabels } from "@/lib/file-preview"
import type { SourceDocument, StudioOutputType } from "@/types"
import { serializeStudioContent } from "./content"
import type {
  BriefingSourceHighlight,
  Flashcard,
  MindMapNode,
  StudioStructuredContent,
  TimelineEvent,
} from "./types"

const studioTitles: Record<StudioOutputType, string> = {
  "audio-overview": "Audio Overview",
  "study-guide": "Study Guide",
  "briefing-doc": "Briefing Doc",
  faq: "FAQ",
  timeline: "Timeline",
  "mind-map": "Mind Map",
  flashcards: "Flashcards",
}

function enabledSources(sources: SourceDocument[]) {
  return sources.filter((source) => source.enabled)
}

function splitDescription(description: string): string[] {
  return description
    .split(/[.!?]\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 10)
    .slice(0, 3)
}

function buildTimeline(sources: SourceDocument[]): StudioStructuredContent {
  const events: TimelineEvent[] = enabledSources(sources)
    .sort(
      (a, b) =>
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
    )
    .map((source) => ({
      id: source.id,
      date: new Date(source.uploadedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      title: source.title,
      description: source.description,
      sourceId: source.id,
      sourceTitle: source.title,
    }))

  if (events.length === 0) {
    events.push({
      id: "empty",
      date: "—",
      title: "No active sources",
      description: "Enable sources in the sidebar to build a timeline.",
    })
  }

  return { format: "timeline", events }
}

function buildMindMap(
  sources: SourceDocument[],
  notebookTitle: string
): StudioStructuredContent {
  const children: MindMapNode[] = enabledSources(sources).map((source) => ({
    id: source.id,
    label: source.title,
    children: splitDescription(source.description).map((chunk, index) => ({
      id: `${source.id}-${index}`,
      label: chunk,
    })),
  }))

  return {
    format: "mind-map",
    root: {
      id: "root",
      label: notebookTitle || "Notebook",
      children,
    },
  }
}

function buildFlashcards(sources: SourceDocument[]): StudioStructuredContent {
  const cards: Flashcard[] = enabledSources(sources).flatMap((source) => [
    {
      id: `${source.id}-about`,
      front: `What is "${source.title}" about?`,
      back: source.description,
      sourceId: source.id,
    },
    {
      id: `${source.id}-type`,
      front: `What type of source is "${source.title}"?`,
      back: fileTypeLabels[source.type],
      sourceId: source.id,
    },
  ])

  if (cards.length === 0) {
    cards.push({
      id: "empty",
      front: "How do I generate flashcards?",
      back: "Upload and enable sources, then generate flashcards from the Studio panel.",
    })
  }

  return { format: "flashcards", cards: cards.slice(0, 24) }
}

function buildBriefingDoc(
  sources: SourceDocument[],
  notebookTitle: string
): StudioStructuredContent {
  const active = enabledSources(sources)

  const highlights: BriefingSourceHighlight[] = active.map((source) => {
    const keyPoint = splitDescription(source.description)[0]

    return {
      id: source.id,
      title: source.title,
      type: fileTypeLabels[source.type],
      summary: source.description,
      keyPoint: keyPoint ?? source.description,
    }
  })

  const executiveSummary =
    active.length === 0
      ? `No active sources are available in "${notebookTitle}". Enable sources in the sidebar to generate a briefing from your material.`
      : `This briefing synthesizes ${active.length} active source${active.length === 1 ? "" : "s"} from "${notebookTitle}". The material spans ${new Set(active.map((source) => source.type)).size} document type${active.length === 1 ? "" : "s"} and is ready for grounded Q&A, deeper review, and follow-up analysis in chat.`

  const recommendations =
    active.length === 0
      ? [
          "Upload and enable at least one source.",
          "Generate a new briefing once sources are active.",
        ]
      : [
          "Start with the highest-signal sources listed below.",
          "Use chat to compare overlapping themes across documents.",
          "Flag any gaps where the sources do not cover your question.",
          "Regenerate the briefing after adding or removing sources.",
        ]

  const coverageGaps =
    active.length === 0
      ? ["No sources are currently active in this notebook."]
      : active.length < 3
        ? ["Limited source coverage — consider adding more material for stronger synthesis."]
        : []

  return {
    format: "briefing-doc",
    notebookTitle,
    generatedAt: new Date().toISOString(),
    executiveSummary,
    sourceCount: active.length,
    highlights,
    recommendations,
    coverageGaps,
  }
}

function buildMarkdownBody(
  type: StudioOutputType,
  sources: SourceDocument[],
  notebookTitle: string
): string {
  const active = enabledSources(sources)
  const sourceList =
    active.length > 0
      ? active.map((source) => `- **${source.title}** — ${source.description}`).join("\n")
      : "- No active sources. Enable sources to include them in generation."

  switch (type) {
    case "study-guide":
      return `## ${notebookTitle}\n\n### Active sources\n${sourceList}\n\n### Review prompts\n1. What themes connect these sources?\n2. Where do the sources agree or conflict?\n3. What is missing from the loaded material?`
    case "faq":
      return `**Q: How many sources are active?**\nA: ${active.length}\n\n**Q: What material is included?**\nA:\n${sourceList}\n\n**Q: Can answers use outside knowledge?**\nA: No — responses should stay grounded in uploaded sources.`
    case "audio-overview":
      return `Host A: Today we're walking through ${active.length} source(s) from "${notebookTitle}".\n\nHost B: ${active.map((source) => source.title).join(", ") || "No sources are active yet."}\n\nHost A: Use chat to dig deeper into any section that needs more detail.`
    default:
      return sourceList
  }
}

export function buildStudioStructuredContent(
  type: StudioOutputType,
  sources: SourceDocument[],
  notebookTitle = "Notebook"
): StudioStructuredContent {
  switch (type) {
    case "timeline":
      return buildTimeline(sources)
    case "mind-map":
      return buildMindMap(sources, notebookTitle)
    case "flashcards":
      return buildFlashcards(sources)
    case "briefing-doc":
      return buildBriefingDoc(sources, notebookTitle)
    default:
      return {
        format: "markdown",
        body: buildMarkdownBody(type, sources, notebookTitle),
      }
  }
}

export function generateStudioPayload(
  type: StudioOutputType,
  sources: SourceDocument[],
  notebookTitle = "Notebook"
) {
  const structured = buildStudioStructuredContent(type, sources, notebookTitle)

  return {
    title: studioTitles[type],
    content: serializeStudioContent(structured),
    duration: type === "audio-overview" ? "8:42" : undefined,
  }
}
