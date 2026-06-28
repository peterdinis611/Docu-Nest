export type InteractionMode =
  | "qa"
  | "summary"
  | "deep-dive"
  | "comparison"
  | "quiz"
  | "outline"
  | "audio"

export type DocumentType = "pdf" | "article" | "note" | "webpage"

export type StudioOutputType =
  | "audio-overview"
  | "study-guide"
  | "briefing-doc"
  | "faq"
  | "timeline"
  | "mind-map"
  | "flashcards"

export type StudioOutputStatus = "idle" | "generating" | "ready"

export interface Notebook {
  id: string
  title: string
  description?: string
  updatedAt: string
  sourceCount: number
  messageCount: number
  color: string
  tags?: string[]
}

export interface NotebookPageData {
  notebook: Notebook
  notebooks: Notebook[]
  documents: SourceDocument[]
  messages: ChatMessage[]
  savedNotes: SavedNote[]
  studioOutputs: StudioOutput[]
}

export interface ActivityItem {
  id: string
  type: "chat" | "upload" | "studio" | "note"
  title: string
  notebookTitle: string
  timestamp: string
}

export interface UsageMetric {
  label: string
  value: number
  change: number
  unit?: string
}

export interface WeeklyActivity {
  day: string
  chats: number
  uploads: number
  studio: number
}

export interface AnalyticsBreakdown {
  chatSessions: number
  avgChatsPerDay: number
  documentsAdded: number
  notebooksWithUploads: number
  studioGenerated: number
  audioOverviews: number
}

export interface AnalyticsEfficiency {
  hoursSaved: number
  hoursSavedChange: number
  answerCount: number
}

export interface AnalyticsData {
  metrics: UsageMetric[]
  weeklyActivity: WeeklyActivity[]
  topNotebooks: { id: string; title: string; messageCount: number }[]
  breakdown: AnalyticsBreakdown
  efficiency: AnalyticsEfficiency
}

export interface SourceDocument {
  id: string
  title: string
  type: DocumentType
  description: string
  pageCount?: number
  uploadedAt: string
  enabled: boolean
  fileKey?: string
  fileUrl?: string
  mimeType?: string
  originalName?: string
  fileSize?: number
}

export interface Citation {
  documentId: string
  documentTitle: string
  section?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
  createdAt: string
}

export interface SavedNote {
  id: string
  title: string
  excerpt: string
  createdAt: string
}

export interface StudioOutput {
  id: string
  type: StudioOutputType
  title: string
  content: string
  status: StudioOutputStatus
  createdAt: string
  duration?: string
}

export interface StudioOutputTemplate {
  type: StudioOutputType
  label: string
  description: string
  icon: string
}

export const STUDIO_TEMPLATES: StudioOutputTemplate[] = [
  {
    type: "audio-overview",
    label: "Audio Overview",
    description: "A conversational deep dive into your sources",
    icon: "Headphones",
  },
  {
    type: "study-guide",
    label: "Study Guide",
    description: "Key concepts, definitions, and review questions",
    icon: "GraduationCap",
  },
  {
    type: "briefing-doc",
    label: "Briefing Doc",
    description: "Executive summary of the material",
    icon: "FileText",
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Frequently asked questions from your sources",
    icon: "HelpCircle",
  },
  {
    type: "timeline",
    label: "Timeline",
    description: "Chronological events and milestones",
    icon: "Clock",
  },
  {
    type: "mind-map",
    label: "Mind Map",
    description: "Visual map of concepts and relationships",
    icon: "Network",
  },
  {
    type: "flashcards",
    label: "Flashcards",
    description: "Quick-review cards for active recall",
    icon: "Layers",
  },
]
