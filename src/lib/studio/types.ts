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
