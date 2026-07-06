import type {
  ChatMessage,
  LibraryDocument,
  Notebook,
  SavedNote,
  SourceDocument,
  StudioOutput,
} from "@/types"
import type {
  MessageRow,
  NotebookRow,
  SavedNoteRow,
  SourceRow,
  StudioOutputRow,
} from "@/db/schema"

export function mapNotebookSummary(
  row: Pick<
    NotebookRow,
    "id" | "title" | "description" | "color" | "tags" | "updatedAt"
  > & {
    sourceCount?: number
    messageCount?: number
  }
): Notebook {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    updatedAt: row.updatedAt,
    sourceCount: row.sourceCount ?? 0,
    messageCount: row.messageCount ?? 0,
    color: row.color,
    tags: row.tags ?? undefined,
  }
}

export function mapSourceDocument(row: SourceRow): SourceDocument {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    description: row.description,
    pageCount: row.pageCount ?? undefined,
    uploadedAt: row.uploadedAt,
    enabled: row.enabled,
    fileKey: row.fileKey ?? undefined,
    fileUrl: row.fileUrl ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    mimeType: row.mimeType ?? undefined,
    originalName: row.originalName ?? undefined,
    fileSize: row.fileSize ?? undefined,
    extractedText: row.extractedText ?? undefined,
    indexStatus: row.indexStatus,
  }
}

export function mapLibraryDocument(
  row: SourceRow & {
    notebookId: string
    notebookTitle: string
    notebookColor: string
  }
): LibraryDocument {
  return {
    ...mapSourceDocument(row),
    notebookId: row.notebookId,
    notebookTitle: row.notebookTitle,
    notebookColor: row.notebookColor,
  }
}

export function mapChatMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    mode: row.mode ?? undefined,
    citations: row.citations ?? undefined,
    createdAt: row.createdAt,
  }
}

export function mapSavedNote(row: SavedNoteRow): SavedNote {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    createdAt: row.createdAt,
  }
}

export function mapStudioOutput(row: StudioOutputRow): StudioOutput {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    status: row.status,
    createdAt: row.createdAt,
    duration: row.duration ?? undefined,
  }
}
