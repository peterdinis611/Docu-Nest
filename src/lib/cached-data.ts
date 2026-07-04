import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import {
  getNotebookById,
  listLibraryDocumentsForUser,
  listNotebooksForUser,
} from "@/db/queries"
import { getAnalyticsForUser } from "@/lib/analytics-service"
import { cacheTags } from "@/lib/cache-tags"
import {
  mapChatMessage,
  mapLibraryDocument,
  mapNotebookSummary,
  mapSavedNote,
  mapSourceDocument,
  mapStudioOutput,
} from "@/lib/notebook-mappers"
import type { LibraryDocument, Notebook, NotebookPageData } from "@/types"
import type { AnalyticsData } from "@/types"

export type SidebarNotebook = {
  id: string
  title: string
  color: string
}

export async function getCachedNotebooksForUser(
  userId: string
): Promise<Notebook[]> {
  "use cache"
  cacheTag(cacheTags.userNotebooks(userId))
  cacheLife("minutes")

  return listNotebooksForUser(userId).map(mapNotebookSummary)
}

export async function getCachedSidebarNotebooks(
  userId: string,
  limit = 4
): Promise<SidebarNotebook[]> {
  "use cache"
  cacheTag(cacheTags.userNotebooks(userId))
  cacheLife("minutes")

  return listNotebooksForUser(userId, limit).map((nb) => ({
    id: nb.id,
    title: nb.title,
    color: nb.color,
  }))
}

export async function getCachedAnalyticsForUser(
  userId: string
): Promise<AnalyticsData> {
  "use cache"
  cacheTag(cacheTags.userAnalytics(userId))
  cacheTag(cacheTags.userNotebooks(userId))
  cacheLife("minutes")

  return getAnalyticsForUser(userId)
}

export async function getCachedLibraryDocumentsForUser(
  userId: string
): Promise<LibraryDocument[]> {
  "use cache"
  cacheTag(cacheTags.userNotebooks(userId))
  cacheLife("minutes")

  return listLibraryDocumentsForUser(userId).map(mapLibraryDocument)
}

export async function getCachedNotebookPageData(
  userId: string,
  notebookId: string
): Promise<NotebookPageData | null> {
  "use cache"
  cacheTag(cacheTags.userNotebook(userId, notebookId))
  cacheTag(cacheTags.userNotebooks(userId))
  cacheLife("minutes")

  const record = getNotebookById(notebookId, userId)

  if (!record) {
    return null
  }

  const summaries = listNotebooksForUser(userId)

  return {
    notebook: mapNotebookSummary({
      id: record.id,
      title: record.title,
      description: record.description,
      color: record.color,
      tags: record.tags,
      updatedAt: record.updatedAt,
      sourceCount: record.sources.length,
      messageCount: record.messages.length,
    }),
    notebooks: summaries.map(mapNotebookSummary),
    documents: record.sources.map(mapSourceDocument),
    messages: record.messages.map(mapChatMessage),
    savedNotes: record.savedNotes.map(mapSavedNote),
    studioOutputs: record.studioOutputs.map(mapStudioOutput),
  }
}
