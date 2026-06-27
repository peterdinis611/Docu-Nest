import "server-only"

import { and, eq, gte } from "drizzle-orm"
import { db } from "@/db/index"
import { listNotebooksForUser } from "@/db/queries"
import { messages, notebooks, sources, studioOutputs } from "@/db/schema"
import { buildAnalyticsData, EMPTY_ANALYTICS } from "@/lib/analytics"
import type { AnalyticsData } from "@/types"

function sinceIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export function getAnalyticsForUser(userId: string): AnalyticsData {
  const since = sinceIso(14)

  const userMessages = db
    .select({
      role: messages.role,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(notebooks, eq(messages.notebookId, notebooks.id))
    .where(and(eq(notebooks.userId, userId), gte(messages.createdAt, since)))
    .all()

  const userSources = db
    .select({
      uploadedAt: sources.uploadedAt,
      notebookId: sources.notebookId,
    })
    .from(sources)
    .innerJoin(notebooks, eq(sources.notebookId, notebooks.id))
    .where(and(eq(notebooks.userId, userId), gte(sources.uploadedAt, since)))
    .all()

  const userStudioOutputs = db
    .select({
      createdAt: studioOutputs.createdAt,
      type: studioOutputs.type,
    })
    .from(studioOutputs)
    .innerJoin(notebooks, eq(studioOutputs.notebookId, notebooks.id))
    .where(
      and(eq(notebooks.userId, userId), gte(studioOutputs.createdAt, since))
    )
    .all()

  const topNotebooks = listNotebooksForUser(userId).map((nb) => ({
    id: nb.id,
    title: nb.title,
    messageCount: nb.messageCount,
  }))

  if (
    userMessages.length === 0 &&
    userSources.length === 0 &&
    userStudioOutputs.length === 0 &&
    topNotebooks.every((nb) => nb.messageCount === 0)
  ) {
    return EMPTY_ANALYTICS
  }

  return buildAnalyticsData({
    messages: userMessages,
    sources: userSources,
    studioOutputs: userStudioOutputs,
    topNotebooks,
  })
}
