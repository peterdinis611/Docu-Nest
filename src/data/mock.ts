import type {
  ChatMessage,
  Notebook,
  SavedNote,
  SourceDocument,
  StudioOutput,
  StudioOutputType,
} from "@/types"

export const mockNotebooks: Notebook[] = [
  {
    id: "nb-1",
    title: "Transformer & RAG Research",
    updatedAt: "2026-06-14T10:00:00Z",
  },
  {
    id: "nb-2",
    title: "Product Notes — DocuNest",
    updatedAt: "2026-06-12T18:30:00Z",
  },
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
    createdAt: "2026-06-13T11:00:00Z",
  },
  {
    id: "note-2",
    title: "RAG pipeline checklist",
    excerpt:
      "Chunk with overlap, hybrid retrieval, always return citations with answers.",
    createdAt: "2026-06-13T15:20:00Z",
  },
]

const studioContent: Record<StudioOutputType, { title: string; content: string; duration?: string }> = {
  "audio-overview": {
    title: "Audio Overview",
    duration: "8:42",
    content: `Host A: Welcome back. Today we're walking through four sources on transformers, RAG, and grounded research assistants.

Host B: Let's start with the big one — "Attention Is All You Need." The core idea is replacing recurrence entirely with self-attention. That means much better parallelization during training.

Host A: The RAG article complements this perfectly. It argues that even powerful models need retrieval when answers must be tied to specific documents.

Host B: And your citation notes make the rules crystal clear — no outside knowledge, always cite, and say when something isn't covered.

Host A: The NotebookLM overview shows how these principles become product features — upload, chat, studio outputs. That's our takeaway.`,
  },
  "study-guide": {
    title: "Study Guide",
    content: `## Key Concepts

**Self-attention** — Mechanism allowing each position in a sequence to attend to all others in parallel.

**RAG (Retrieval-Augmented Generation)** — Combines retrieval from a document store with generation for grounded answers.

**Source grounding** — Policy that all assistant output must come exclusively from uploaded sources.

## Review Questions

1. Why does the Transformer dispense with recurrence?
2. What three citation formats appear across your notes?
3. Name two retrieval strategies recommended in the RAG article.
4. What should the assistant do when a topic isn't in the sources?`,
  },
  "briefing-doc": {
    title: "Briefing Doc",
    content: `## Executive Summary

Your notebook assembles technical and product perspectives on building source-grounded research assistants.

The Transformer paper provides the architectural foundation for modern language models. The RAG article operationalizes grounding through retrieval pipelines. Citation notes define editorial policy. The NotebookLM overview maps these ideas to user-facing features.

## Recommendation

Prioritize hybrid retrieval, strict citation formatting, and clear gap acknowledgment in any assistant built on this material.`,
  },
  "faq": {
    title: "FAQ",
    content: `**Q: Can the assistant use outside knowledge?**
A: No. All answers must come from uploaded sources only.

**Q: What citation format should be used?**
A: [Source: document name, section/page] for single sources; [Sources: doc1, doc2] when synthesizing.

**Q: What happens when information is missing?**
A: The assistant should clearly state the topic isn't covered in the sources.

**Q: What does the Transformer paper contribute?**
A: A sequence transduction architecture based solely on attention, without recurrence or convolutions.`,
  },
  timeline: {
    title: "Timeline",
    content: `**2017** — "Attention Is All You Need" introduces the Transformer architecture.

**2020s** — RAG patterns emerge as standard for document-grounded assistants.

**2026** — Product tools like NotebookLM popularize upload → chat → studio workflows.

**Current notebook** — Four sources loaded covering architecture, retrieval, citations, and product design.`,
  },
  "mind-map": {
    title: "Mind Map",
    content: `Center: **Source-Grounded Research Assistant**

Branches:
├── Architecture (Transformer, self-attention, parallelization)
├── Retrieval (chunking, hybrid search, overlap)
├── Policy (citations, no outside knowledge, gap acknowledgment)
└── UX (upload sources, Q&A chat, studio outputs, saved notes)`,
  },
  flashcards: {
    title: "Flashcards",
    content: `**Card 1**
Q: What mechanism replaces recurrence in the Transformer?
A: Self-attention

**Card 2**
Q: What does RAG stand for?
A: Retrieval-Augmented Generation

**Card 3**
Q: Single-source citation format?
A: [Source: document name, section/page]

**Card 4**
Q: What to say when sources lack an answer?
A: "This isn't covered in your sources."`,
  },
}

const mockResponses: Record<string, string> = {
  default:
    "Based on your selected sources, answers are grounded exclusively in uploaded documents. When information is missing, the assistant states that clearly. Citations follow [Source: document name, section/page].",
  transformer:
    "The Transformer proposes an architecture based solely on attention mechanisms, dispensing with recurrence and convolutions. It achieves strong machine translation results while training faster through parallelization.\n\n[Source: Attention Is All You Need, Introduction]",
  rag: "The RAG article recommends chunking with overlap, hybrid retrieval (dense + sparse), and returning citations with every answer. The assistant must never supplement with outside knowledge.\n\n[Source: RAG Best Practices, Retrieval Pipeline]",
  citations:
    "Inline citations use [Source: document name, section/page]. Cross-source synthesis uses [Sources: doc1, doc2]. Framing not from sources should be labeled explicitly.\n\n[Source: Research Notes — Citation Formats]",
}

export function getMockResponse(question: string): ChatMessage {
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

export function createStudioOutput(type: StudioOutputType): StudioOutput {
  const template = studioContent[type]
  return {
    id: crypto.randomUUID(),
    type,
    title: template.title,
    content: template.content,
    status: "ready",
    createdAt: new Date().toISOString(),
    duration: template.duration,
  }
}
