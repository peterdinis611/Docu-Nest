import { desc, eq, sql, and } from "drizzle-orm"
import { db } from "./index"
import {
  messages,
  notebooks,
  savedNotes,
  sources,
  studioOutputs,
} from "./schema"
import type { ActivityItem } from "@/types"

function truncateActivityTitle(text: string, max = 72) {
  const normalized = text.trim().replace(/\s+/g, " ")
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

export function createNotebookForUser(
  userId: string,
  input: {
    id: string
    title: string
    description?: string
    color: string
  }
) {
  const now = new Date().toISOString()

  db.insert(notebooks)
    .values({
      id: input.id,
      userId,
      title: input.title,
      description: input.description ?? null,
      color: input.color,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return {
    id: input.id,
    title: input.title,
    description: input.description ?? null,
    color: input.color,
    tags: null,
    createdAt: now,
    updatedAt: now,
    userId,
  }
}

export function createSourceForNotebook(
  userId: string,
  input: {
    id: string
    notebookId: string
    title: string
    type: "pdf" | "article" | "note" | "webpage"
    description?: string
    uploadthingFileId: string
    fileUrl: string
    mimeType?: string
    originalName: string
    fileSize?: number
  }
) {
  const notebook = db
    .select({ id: notebooks.id })
    .from(notebooks)
    .where(and(eq(notebooks.id, input.notebookId), eq(notebooks.userId, userId)))
    .get()

  if (!notebook) {
    throw new Error("Notebook not found")
  }

  const existing = db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.notebookId, input.notebookId),
        eq(sources.fileKey, input.uploadthingFileId)
      )
    )
    .get()

  if (existing) {
    return existing
  }

  const now = new Date().toISOString()

  db.insert(sources)
    .values({
      id: input.id,
      notebookId: input.notebookId,
      title: input.title,
      type: input.type,
      description: input.description ?? "Uploaded file — indexing pending.",
      fileKey: input.uploadthingFileId,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType ?? null,
      originalName: input.originalName,
      fileSize: input.fileSize ?? null,
      enabled: true,
      uploadedAt: now,
    })
    .run()

  db.update(notebooks)
    .set({ updatedAt: now })
    .where(eq(notebooks.id, input.notebookId))
    .run()

  return db.select().from(sources).where(eq(sources.id, input.id)).get()!
}

export function listNotebooksForUser(userId: string, limit?: number) {
  const query = db
    .select({
      id: notebooks.id,
      title: notebooks.title,
      description: notebooks.description,
      color: notebooks.color,
      tags: notebooks.tags,
      updatedAt: notebooks.updatedAt,
      sourceCount: sql<number>`count(distinct ${sources.id})`,
      messageCount: sql<number>`count(distinct ${messages.id})`,
    })
    .from(notebooks)
    .leftJoin(sources, eq(sources.notebookId, notebooks.id))
    .leftJoin(messages, eq(messages.notebookId, notebooks.id))
    .where(eq(notebooks.userId, userId))
    .groupBy(notebooks.id)
    .orderBy(desc(notebooks.updatedAt))

  return (limit ? query.limit(limit) : query).all()
}

export function listRecentActivityForUser(
  userId: string,
  limit = 5
): ActivityItem[] {
  const userMessages = db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      notebookTitle: notebooks.title,
    })
    .from(messages)
    .innerJoin(notebooks, eq(messages.notebookId, notebooks.id))
    .where(and(eq(notebooks.userId, userId), eq(messages.role, "user")))
    .all()

  const userSources = db
    .select({
      id: sources.id,
      title: sources.title,
      uploadedAt: sources.uploadedAt,
      notebookTitle: notebooks.title,
    })
    .from(sources)
    .innerJoin(notebooks, eq(sources.notebookId, notebooks.id))
    .where(eq(notebooks.userId, userId))
    .all()

  const userStudioOutputs = db
    .select({
      id: studioOutputs.id,
      title: studioOutputs.title,
      createdAt: studioOutputs.createdAt,
      notebookTitle: notebooks.title,
    })
    .from(studioOutputs)
    .innerJoin(notebooks, eq(studioOutputs.notebookId, notebooks.id))
    .where(and(eq(notebooks.userId, userId), eq(studioOutputs.status, "ready")))
    .all()

  const userSavedNotes = db
    .select({
      id: savedNotes.id,
      title: savedNotes.title,
      createdAt: savedNotes.createdAt,
      notebookTitle: notebooks.title,
    })
    .from(savedNotes)
    .innerJoin(notebooks, eq(savedNotes.notebookId, notebooks.id))
    .where(eq(notebooks.userId, userId))
    .all()

  const items: ActivityItem[] = [
    ...userMessages.map((message) => ({
      id: `chat-${message.id}`,
      type: "chat" as const,
      title: truncateActivityTitle(message.content),
      notebookTitle: message.notebookTitle,
      timestamp: message.createdAt,
    })),
    ...userSources.map((source) => ({
      id: `upload-${source.id}`,
      type: "upload" as const,
      title: `Uploaded ${source.title}`,
      notebookTitle: source.notebookTitle,
      timestamp: source.uploadedAt,
    })),
    ...userStudioOutputs.map((output) => ({
      id: `studio-${output.id}`,
      type: "studio" as const,
      title: `Generated ${output.title}`,
      notebookTitle: output.notebookTitle,
      timestamp: output.createdAt,
    })),
    ...userSavedNotes.map((note) => ({
      id: `note-${note.id}`,
      type: "note" as const,
      title: `Saved ${note.title}`,
      notebookTitle: note.notebookTitle,
      timestamp: note.createdAt,
    })),
  ]

  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit)
}

export function listSourcesForUser(userId: string) {
  return db
    .select({
      id: sources.id,
      title: sources.title,
      type: sources.type,
      notebookId: sources.notebookId,
      notebookTitle: notebooks.title,
    })
    .from(sources)
    .innerJoin(notebooks, eq(sources.notebookId, notebooks.id))
    .where(eq(notebooks.userId, userId))
    .orderBy(desc(sources.uploadedAt))
    .all()
}

export function listLibraryDocumentsForUser(userId: string) {
  return db
    .select({
      id: sources.id,
      title: sources.title,
      type: sources.type,
      description: sources.description,
      pageCount: sources.pageCount,
      uploadedAt: sources.uploadedAt,
      enabled: sources.enabled,
      fileKey: sources.fileKey,
      fileUrl: sources.fileUrl,
      mimeType: sources.mimeType,
      originalName: sources.originalName,
      fileSize: sources.fileSize,
      notebookId: notebooks.id,
      notebookTitle: notebooks.title,
      notebookColor: notebooks.color,
    })
    .from(sources)
    .innerJoin(notebooks, eq(sources.notebookId, notebooks.id))
    .where(eq(notebooks.userId, userId))
    .orderBy(desc(sources.uploadedAt))
    .all()
}

export function getNotebookById(notebookId: string, userId: string) {
  return db.query.notebooks
    .findFirst({
      where: (table, { and, eq: equals }) =>
        and(equals(table.id, notebookId), equals(table.userId, userId)),
      with: {
        sources: true,
        messages: {
          orderBy: (table, { asc }) => asc(table.createdAt),
        },
        savedNotes: {
          orderBy: (table, { desc }) => desc(table.createdAt),
        },
        studioOutputs: {
          orderBy: (table, { desc }) => desc(table.createdAt),
        },
      },
    })
    .sync()
}

export function listSourcesForNotebook(notebookId: string) {
  return db
    .select()
    .from(sources)
    .where(eq(sources.notebookId, notebookId))
    .orderBy(desc(sources.uploadedAt))
    .all()
}

export function listMessagesForNotebook(notebookId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.notebookId, notebookId))
    .orderBy(messages.createdAt)
    .all()
}

export function listSavedNotesForNotebook(notebookId: string) {
  return db
    .select()
    .from(savedNotes)
    .where(eq(savedNotes.notebookId, notebookId))
    .orderBy(desc(savedNotes.createdAt))
    .all()
}

export function listStudioOutputsForNotebook(notebookId: string) {
  return db
    .select()
    .from(studioOutputs)
    .where(eq(studioOutputs.notebookId, notebookId))
    .orderBy(desc(studioOutputs.createdAt))
    .all()
}

export function getSourceForNotebook(
  sourceId: string,
  notebookId: string,
  userId: string
) {
  return db
    .select({ source: sources })
    .from(sources)
    .innerJoin(notebooks, eq(sources.notebookId, notebooks.id))
    .where(
      and(
        eq(sources.id, sourceId),
        eq(sources.notebookId, notebookId),
        eq(notebooks.userId, userId)
      )
    )
    .get()
}

export function createChatExchangeForNotebook(
  userId: string,
  input: {
    notebookId: string
    userMessage: { id: string; content: string }
    assistantMessage: {
      id: string
      content: string
      citations?: Array<{
        documentId: string
        documentTitle: string
        section?: string
      }>
    }
  }
) {
  const notebook = db
    .select({ id: notebooks.id })
    .from(notebooks)
    .where(and(eq(notebooks.id, input.notebookId), eq(notebooks.userId, userId)))
    .get()

  if (!notebook) {
    throw new Error("Notebook not found")
  }

  const now = new Date().toISOString()

  db.insert(messages)
    .values({
      id: input.userMessage.id,
      notebookId: input.notebookId,
      role: "user",
      content: input.userMessage.content,
      createdAt: now,
    })
    .run()

  db.insert(messages)
    .values({
      id: input.assistantMessage.id,
      notebookId: input.notebookId,
      role: "assistant",
      content: input.assistantMessage.content,
      citations: input.assistantMessage.citations ?? null,
      createdAt: now,
    })
    .run()

  db.update(notebooks)
    .set({ updatedAt: now })
    .where(eq(notebooks.id, input.notebookId))
    .run()

  const userMessage = db
    .select()
    .from(messages)
    .where(eq(messages.id, input.userMessage.id))
    .get()!

  const assistantMessage = db
    .select()
    .from(messages)
    .where(eq(messages.id, input.assistantMessage.id))
    .get()!

  return { userMessage, assistantMessage }
}

export function updateSourceForNotebook(
  userId: string,
  input: {
    notebookId: string
    sourceId: string
    title?: string
    description?: string
    enabled?: boolean
  }
) {
  const existing = getSourceForNotebook(input.sourceId, input.notebookId, userId)

  if (!existing) {
    throw new Error("Source not found")
  }

  const updates: {
    title?: string
    description?: string
    enabled?: boolean
  } = {}

  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.enabled !== undefined) updates.enabled = input.enabled

  if (Object.keys(updates).length > 0) {
    db.update(sources)
      .set(updates)
      .where(eq(sources.id, input.sourceId))
      .run()
  }

  const now = new Date().toISOString()

  db.update(notebooks)
    .set({ updatedAt: now })
    .where(eq(notebooks.id, input.notebookId))
    .run()

  return db.select().from(sources).where(eq(sources.id, input.sourceId)).get()!
}

export function deleteSourceForNotebook(
  userId: string,
  notebookId: string,
  sourceId: string
) {
  const existing = getSourceForNotebook(sourceId, notebookId, userId)

  if (!existing) {
    throw new Error("Source not found")
  }

  db.delete(sources).where(eq(sources.id, sourceId)).run()

  const now = new Date().toISOString()

  db.update(notebooks)
    .set({ updatedAt: now })
    .where(eq(notebooks.id, notebookId))
    .run()

  return { id: sourceId }
}

export function updateNotebookForUser(
  userId: string,
  notebookId: string,
  input: {
    title?: string
    description?: string | null
  }
) {
  const notebook = db
    .select()
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
    .get()

  if (!notebook) {
    throw new Error("Notebook not found")
  }

  const now = new Date().toISOString()
  const updates: {
    title?: string
    description?: string | null
    updatedAt: string
  } = { updatedAt: now }

  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description

  db.update(notebooks)
    .set(updates)
    .where(eq(notebooks.id, notebookId))
    .run()

  return db.select().from(notebooks).where(eq(notebooks.id, notebookId)).get()!
}

export function deleteNotebookForUser(userId: string, notebookId: string) {
  const notebook = db
    .select({ id: notebooks.id })
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
    .get()

  if (!notebook) {
    throw new Error("Notebook not found")
  }

  db.delete(notebooks).where(eq(notebooks.id, notebookId)).run()

  return { id: notebookId }
}

export function clearMessagesForNotebook(userId: string, notebookId: string) {
  const notebook = db
    .select({ id: notebooks.id })
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)))
    .get()

  if (!notebook) {
    throw new Error("Notebook not found")
  }

  db.delete(messages).where(eq(messages.notebookId, notebookId)).run()

  const now = new Date().toISOString()

  db.update(notebooks)
    .set({ updatedAt: now })
    .where(eq(notebooks.id, notebookId))
    .run()

  return { notebookId }
}

export function createStudioOutputForNotebook(
  userId: string,
  input: {
    id: string
    notebookId: string
    type:
      | "audio-overview"
      | "study-guide"
      | "briefing-doc"
      | "faq"
      | "timeline"
      | "mind-map"
      | "flashcards"
    title: string
    content: string
    duration?: string
  }
) {
  const notebook = db
    .select({ id: notebooks.id, title: notebooks.title })
    .from(notebooks)
    .where(and(eq(notebooks.id, input.notebookId), eq(notebooks.userId, userId)))
    .get()

  if (!notebook) {
    throw new Error("Notebook not found")
  }

  const now = new Date().toISOString()

  db.insert(studioOutputs)
    .values({
      id: input.id,
      notebookId: input.notebookId,
      type: input.type,
      title: input.title,
      content: input.content,
      status: "ready",
      duration: input.duration ?? null,
      createdAt: now,
    })
    .run()

  db.update(notebooks)
    .set({ updatedAt: now })
    .where(eq(notebooks.id, input.notebookId))
    .run()

  return db.select().from(studioOutputs).where(eq(studioOutputs.id, input.id)).get()!
}

export function deleteAllNotebooksForUser(userId: string) {
  const count = db
    .select({ id: notebooks.id })
    .from(notebooks)
    .where(eq(notebooks.userId, userId))
    .all().length

  db.delete(notebooks).where(eq(notebooks.userId, userId)).run()

  return { deletedCount: count }
}
