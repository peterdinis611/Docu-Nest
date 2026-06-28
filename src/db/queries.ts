import { desc, eq, sql, and } from "drizzle-orm"
import { db } from "./index"
import {
  messages,
  notebooks,
  savedNotes,
  sources,
  studioOutputs,
} from "./schema"

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
    fileKey: string
    fileUrl: string
    mimeType?: string
    originalName: string
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

  db.insert(sources)
    .values({
      id: input.id,
      notebookId: input.notebookId,
      title: input.title,
      type: input.type,
      description: input.description ?? "Uploaded file — indexing pending.",
      fileKey: input.fileKey,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType ?? null,
      originalName: input.originalName,
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
