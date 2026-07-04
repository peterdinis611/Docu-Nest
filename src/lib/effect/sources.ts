import { Effect } from "effect"
import { updateTag } from "next/cache"
import {
  deleteSourceForNotebook,
  updateSourceForNotebook,
} from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { NotFoundError } from "@/lib/effect/errors"
import { mapSourceDocument } from "@/lib/notebook-mappers"
import type { SourceDocument } from "@/types"

function invalidateSourceCaches(userId: string, notebookId: string) {
  updateTag(cacheTags.userNotebook(userId, notebookId))
  updateTag(cacheTags.userNotebooks(userId))
  updateTag(cacheTags.userAnalytics(userId))
}

export const updateSourceEffect = Effect.fn("updateSource")(function* (input: {
  userId: string
  notebookId: string
  sourceId: string
  title?: string
  description?: string
  enabled?: boolean
}) {
  try {
    const row = updateSourceForNotebook(input.userId, {
      notebookId: input.notebookId,
      sourceId: input.sourceId,
      title: input.title,
      description: input.description,
      enabled: input.enabled,
    })

    invalidateSourceCaches(input.userId, input.notebookId)

    const source: SourceDocument = mapSourceDocument(row)
    return { source }
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Source", id: input.sourceId })
    )
  }
})

export const deleteSourceEffect = Effect.fn("deleteSource")(function* (input: {
  userId: string
  notebookId: string
  sourceId: string
}) {
  try {
    const result = deleteSourceForNotebook(
      input.userId,
      input.notebookId,
      input.sourceId
    )

    invalidateSourceCaches(input.userId, input.notebookId)

    return result
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Source", id: input.sourceId })
    )
  }
})
