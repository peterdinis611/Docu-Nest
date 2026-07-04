import { fileTypeLabels } from "@/lib/file-preview"
import { clamp } from "@/lib/math"
import type { SourceDocument, StudioOutputType } from "@/types"
import { serializeStudioContent } from "./content"
import type {
  BriefingSourceHighlight,
  Flashcard,
  MindMapNode,
  StudioStructuredContent,
  TimelineEvent,
} from "./types"

export const STUDIO_TITLES: Record<StudioOutputType, string> = {
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

function buildStudyGuide(
  sources: SourceDocument[],
  notebookTitle: string
): StudioStructuredContent {
  const active = enabledSources(sources)

  const concepts = active.flatMap((source) => {
    const chunks = splitDescription(source.description)
    if (chunks.length === 0) {
      return [
        {
          id: `${source.id}-0`,
          term: source.title,
          definition: source.description,
          sourceTitle: source.title,
        },
      ]
    }

    return chunks.map((chunk, index) => ({
      id: `${source.id}-${index}`,
      term: index === 0 ? source.title : `${source.title} — point ${index + 1}`,
      definition: chunk,
      sourceTitle: source.title,
    }))
  })

  const reviewQuestions =
    active.length === 0
      ? ["Upload sources to generate review questions."]
      : [
          `What themes connect the ${active.length} active source(s)?`,
          "Where do the sources agree or conflict?",
          "What important topics are missing from the loaded material?",
          ...active.slice(0, 3).map((source) => `Summarize the key idea of "${source.title}".`),
        ]

  return {
    format: "study-guide",
    notebookTitle,
    concepts: concepts.slice(0, 12),
    reviewQuestions,
  }
}

function buildFaq(sources: SourceDocument[]): StudioStructuredContent {
  const active = enabledSources(sources)

  const items =
    active.length === 0
      ? [
          {
            id: "empty",
            question: "Why is the FAQ empty?",
            answer: "Enable at least one source to generate questions from your material.",
          },
        ]
      : active.flatMap((source) => [
          {
            id: `${source.id}-about`,
            question: `What is "${source.title}" about?`,
            answer: source.description,
            sourceTitle: source.title,
          },
          {
            id: `${source.id}-type`,
            question: `What type of document is "${source.title}"?`,
            answer: `It is a ${fileTypeLabels[source.type]} source in this notebook.`,
            sourceTitle: source.title,
          },
        ])

  return { format: "faq", items: items.slice(0, 16) }
}

function buildAudioOverview(
  sources: SourceDocument[],
  notebookTitle: string
): StudioStructuredContent {
  const active = enabledSources(sources)

  if (active.length === 0) {
    return {
      format: "audio-overview",
      notebookTitle,
      duration: "0:00",
      summary: "No active sources to discuss.",
      segments: [
        {
          id: "empty-a",
          speaker: "host-a",
          text: "There are no active sources in this notebook yet.",
        },
        {
          id: "empty-b",
          speaker: "host-b",
          text: "Upload and enable sources, then regenerate the audio overview.",
        },
      ],
    }
  }

  const segments = active.flatMap((source, index) => {
    const speaker = index % 2 === 0 ? ("host-a" as const) : ("host-b" as const)
    const otherSpeaker = speaker === "host-a" ? ("host-b" as const) : ("host-a" as const)

    return [
      {
        id: `${source.id}-intro`,
        speaker,
        text: `Let's look at "${source.title}" — a ${fileTypeLabels[source.type]} source.`,
      },
      {
        id: `${source.id}-detail`,
        speaker: otherSpeaker,
        text: source.description,
      },
    ]
  })

  const minutes = clamp(active.length * 2, 3, 12)
  const seconds = clamp(active.length * 17, 0, 59)

  return {
    format: "audio-overview",
    notebookTitle,
    duration: `${minutes}:${String(seconds).padStart(2, "0")}`,
    summary: `A conversational walkthrough of ${active.length} source(s) from "${notebookTitle}".`,
    segments: segments.slice(0, 20),
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
    case "study-guide":
      return buildStudyGuide(sources, notebookTitle)
    case "faq":
      return buildFaq(sources)
    case "audio-overview":
      return buildAudioOverview(sources, notebookTitle)
    default:
      return { format: "markdown", body: "Unsupported studio output type." }
  }
}

export function generateStudioPayload(
  type: StudioOutputType,
  sources: SourceDocument[],
  notebookTitle = "Notebook"
) {
  const structured = buildStudioStructuredContent(type, sources, notebookTitle)

  return {
    title: STUDIO_TITLES[type],
    content: serializeStudioContent(structured),
    duration:
      type === "audio-overview" && structured.format === "audio-overview"
        ? structured.duration
        : undefined,
  }
}
