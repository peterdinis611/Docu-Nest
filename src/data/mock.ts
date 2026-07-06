import type {
  ActivityItem,
  ChatMessage,
  Notebook,
  SavedNote,
  SourceDocument,
  StudioOutput,
  StudioOutputType,
  UsageMetric,
  WeeklyActivity,
} from "@/types"
import { generateStudioPayload } from "@/lib/studio/generate"

export const mockNotebooks: Notebook[] = [
  {
    id: "nb-1",
    title: "Transformer & RAG Research",
    description: "Architecture papers, retrieval patterns, and citation policy",
    updatedAt: "2026-06-14T10:00:00Z",
    sourceCount: 4,
    messageCount: 23,
    color: "from-blue-500/20 to-indigo-500/10",
    tags: ["research", "ml"],
  },
  {
    id: "nb-2",
    title: "Product Notes — DocuNest",
    description: "Feature specs, UX flows, and competitive analysis",
    updatedAt: "2026-06-12T18:30:00Z",
    sourceCount: 6,
    messageCount: 41,
    color: "from-emerald-500/20 to-teal-500/10",
    tags: ["product", "design"],
  },
  {
    id: "nb-3",
    title: "Legal Contract Review",
    description: "MSA drafts, SLA terms, and compliance checklists",
    updatedAt: "2026-06-11T09:15:00Z",
    sourceCount: 3,
    messageCount: 12,
    color: "from-amber-500/20 to-orange-500/10",
    tags: ["legal"],
  },
  {
    id: "nb-4",
    title: "Customer Interviews Q2",
    description: "Transcripts and synthesis from 8 user research sessions",
    updatedAt: "2026-06-09T14:00:00Z",
    sourceCount: 8,
    messageCount: 67,
    color: "from-violet-500/20 to-purple-500/10",
    tags: ["research", "ux"],
  },
]

export const mockActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "chat",
    title: "Asked about Transformer parallelization",
    notebookTitle: "Transformer & RAG Research",
    timestamp: "2026-06-14T10:00:00Z",
  },
  {
    id: "act-2",
    type: "studio",
    title: "Generated Audio Overview",
    notebookTitle: "Transformer & RAG Research",
    timestamp: "2026-06-14T09:30:00Z",
  },
  {
    id: "act-3",
    type: "upload",
    title: "Uploaded NotebookLM Feature Overview",
    notebookTitle: "Transformer & RAG Research",
    timestamp: "2026-06-13T16:45:00Z",
  },
  {
    id: "act-4",
    type: "note",
    title: "Saved citation format rules",
    notebookTitle: "Transformer & RAG Research",
    timestamp: "2026-06-13T11:00:00Z",
  },
  {
    id: "act-5",
    type: "chat",
    title: "Compared onboarding flows",
    notebookTitle: "Product Notes — DocuNest",
    timestamp: "2026-06-12T18:30:00Z",
  },
]

export const mockUsageMetrics: UsageMetric[] = [
  { label: "Questions asked", value: 143, change: 12 },
  { label: "Sources indexed", value: 21, change: 4 },
  { label: "Studio outputs", value: 18, change: 6 },
  { label: "Hours saved", value: 9.5, change: 2.1, unit: "h" },
]

export const mockWeeklyActivity: WeeklyActivity[] = [
  { day: "Mon", chats: 12, uploads: 2, studio: 3 },
  { day: "Tue", chats: 18, uploads: 1, studio: 5 },
  { day: "Wed", chats: 8, uploads: 3, studio: 2 },
  { day: "Thu", chats: 22, uploads: 0, studio: 4 },
  { day: "Fri", chats: 15, uploads: 2, studio: 1 },
  { day: "Sat", chats: 6, uploads: 0, studio: 2 },
  { day: "Sun", chats: 4, uploads: 1, studio: 1 },
]

export const mockDocuments: SourceDocument[] = [
  {
    id: "doc-1",
    title: "Attention Is All You Need",
    type: "pdf",
    description:
      "Seminal paper introducing the Transformer architecture for sequence transduction.",
    pageCount: 15,
    uploadedAt: "2026-06-10T09:00:00Z",
    enabled: true,
  },
  {
    id: "doc-2",
    title: "RAG Best Practices",
    type: "article",
    description:
      "Guide to retrieval-augmented generation patterns for grounded AI assistants.",
    uploadedAt: "2026-06-11T14:30:00Z",
    enabled: true,
  },
  {
    id: "doc-3",
    title: "Research Notes — Citation Formats",
    type: "note",
    description:
      "Personal notes on inline citation conventions and source-grounding rules.",
    uploadedAt: "2026-06-12T08:15:00Z",
    enabled: true,
  },
  {
    id: "doc-4",
    title: "NotebookLM Feature Overview",
    type: "webpage",
    description:
      "Product page describing document upload, Q&A, and audio overview features.",
    uploadedAt: "2026-06-13T16:45:00Z",
    enabled: true,
  },
]

export const mockAllDocuments: (SourceDocument & {
  notebookId: string
  notebookTitle: string
})[] = [
  ...mockDocuments.map((d) => ({
    ...d,
    notebookId: "nb-1",
    notebookTitle: "Transformer & RAG Research",
  })),
  {
    id: "doc-5",
    title: "DocuNest PRD v2",
    type: "pdf" as const,
    description: "Product requirements for source-grounded notebook assistant.",
    pageCount: 24,
    uploadedAt: "2026-06-08T10:00:00Z",
    enabled: true,
    notebookId: "nb-2",
    notebookTitle: "Product Notes — DocuNest",
  },
  {
    id: "doc-6",
    title: "Competitive Landscape",
    type: "article" as const,
    description: "Analysis of NotebookLM, Perplexity Spaces, and similar tools.",
    uploadedAt: "2026-06-07T14:00:00Z",
    enabled: true,
    notebookId: "nb-2",
    notebookTitle: "Product Notes — DocuNest",
  },
  {
    id: "doc-7",
    title: "MSA Template 2026",
    type: "pdf" as const,
    description: "Standard master services agreement with liability caps.",
    pageCount: 18,
    uploadedAt: "2026-06-05T11:00:00Z",
    enabled: true,
    notebookId: "nb-3",
    notebookTitle: "Legal Contract Review",
  },
]

export const mockSourceGuide =
  "This notebook covers transformer architecture fundamentals, retrieval-augmented generation patterns, citation conventions for grounded assistants, and product-level notebook features. Together, the sources emphasize source-only answering, inline citations, and multiple ways to explore material — from Q&A to audio overviews and study guides."

export const mockSuggestedQuestions = [
  "What is the core contribution of the Transformer paper?",
  "How do the sources define grounded citations?",
  "What retrieval strategies does the RAG article recommend?",
  "Where do the sources agree on source-only answering?",
  "What gaps exist across the loaded material?",
]

export const mockSavedNotes: SavedNote[] = [
  {
    id: "note-1",
    title: "Citation format rules",
    excerpt:
      "Use [Source: doc, section] for single refs. Label synthesis and framing explicitly.",
    body:
      "Use [Source: doc, section] for single refs. Label synthesis and framing explicitly.",
    createdAt: "2026-06-13T11:00:00Z",
  },
  {
    id: "note-2",
    title: "RAG pipeline checklist",
    excerpt:
      "Chunk with overlap, hybrid retrieval, always return citations with answers.",
    body:
      "Chunk with overlap, hybrid retrieval, always return citations with answers.",
    createdAt: "2026-06-13T15:20:00Z",
  },
]

const mockResponses: Record<string, string> = {
  default:
    "Based on your selected sources, answers are grounded exclusively in uploaded documents. When information is missing, the assistant states that clearly. Citations follow [Source: document name, section/page].",
  transformer:
    "The Transformer proposes an architecture based solely on attention mechanisms, dispensing with recurrence and convolutions. It achieves strong machine translation results while training faster through parallelization.\n\n[Source: Attention Is All You Need, Introduction]",
  rag: "The RAG article recommends chunking with overlap, hybrid retrieval (dense + sparse), and returning citations with every answer. The assistant must never supplement with outside knowledge.\n\n[Source: RAG Best Practices, Retrieval Pipeline]",
  citations:
    "Inline citations use [Source: document name, section/page]. Cross-source synthesis uses [Sources: doc1, doc2]. Framing not from sources should be labeled explicitly.\n\n[Source: Research Notes — Citation Formats]",
}

export function getMockResponse(
  question: string,
  source?: SourceDocument
): ChatMessage {
  if (source) {
    const lower = question.toLowerCase()
    const titleLower = source.title.toLowerCase()

    let content = `Based on "${source.title}": ${source.description}`

    if (lower.includes("summarize") || lower.includes("main points")) {
      content = `"${source.title}" focuses on: ${source.description}\n\n[Source: ${source.title}]`
    } else if (titleLower.includes("transformer") || lower.includes("attention")) {
      content = mockResponses.transformer
    } else if (titleLower.includes("rag") || lower.includes("retrieval")) {
      content = mockResponses.rag
    }

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      citations: [
        { documentId: source.id, documentTitle: source.title },
      ],
      createdAt: new Date().toISOString(),
    }
  }

  const lower = question.toLowerCase()
  let content = mockResponses.default

  if (lower.includes("transformer") || lower.includes("attention")) {
    content = mockResponses.transformer
  } else if (lower.includes("rag") || lower.includes("retrieval")) {
    content = mockResponses.rag
  } else if (lower.includes("citation") || lower.includes("cite")) {
    content = mockResponses.citations
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    citations: [
      { documentId: "doc-1", documentTitle: "Attention Is All You Need" },
      { documentId: "doc-2", documentTitle: "RAG Best Practices" },
    ],
    createdAt: new Date().toISOString(),
  }
}

export function createStudioOutput(
  type: StudioOutputType,
  sources: SourceDocument[] = mockDocuments,
  notebookTitle = "Notebook"
): StudioOutput {
  const payload = generateStudioPayload(type, sources, notebookTitle)
  return {
    id: crypto.randomUUID(),
    type,
    title: payload.title,
    content: payload.content,
    status: "ready",
    createdAt: new Date().toISOString(),
    duration: payload.duration,
  }
}
