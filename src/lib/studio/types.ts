export interface BriefingSourceHighlight {
  id: string
  title: string
  type: string
  summary: string
  keyPoint: string
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  sourceId?: string
  sourceTitle?: string
}

export interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
}

export interface Flashcard {
  id: string
  front: string
  back: string
  sourceId?: string
}

export interface StudyGuideConcept {
  id: string
  term: string
  definition: string
  sourceTitle?: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  sourceTitle?: string
}

export interface AudioSegment {
  id: string
  speaker: "host-a" | "host-b"
  text: string
}

export type StudioStructuredContent =
  | { format: "markdown"; body: string }
  | {
      format: "briefing-doc"
      notebookTitle: string
      generatedAt: string
      executiveSummary: string
      sourceCount: number
      highlights: BriefingSourceHighlight[]
      recommendations: string[]
      coverageGaps: string[]
    }
  | { format: "timeline"; events: TimelineEvent[] }
  | { format: "mind-map"; root: MindMapNode }
  | { format: "flashcards"; cards: Flashcard[] }
  | {
      format: "study-guide"
      notebookTitle: string
      concepts: StudyGuideConcept[]
      reviewQuestions: string[]
    }
  | { format: "faq"; items: FaqItem[] }
  | {
      format: "audio-overview"
      notebookTitle: string
      duration: string
      summary: string
      segments: AudioSegment[]
    }
