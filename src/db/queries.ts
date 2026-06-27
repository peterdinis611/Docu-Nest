import { desc, eq, sql } from "drizzle-orm"
import { db } from "./index"
import {
  messages,
  notebooks,
  savedNotes,
  sources,
  studioOutputs,
} from "./schema"

export function listNotebooksForUser(userId: string) {
  return db
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
    .all()
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
  return db.query.notebooks.findFirst({
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
