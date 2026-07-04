import { Effect } from "effect"
import { updateTag } from "next/cache"
import {
  deleteAllNotebooksForUser,
  deleteNotebookForUser,
  updateNotebookForUser,
} from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { NotFoundError } from "@/lib/effect/errors"
import { mapNotebookSummary } from "@/lib/notebook-mappers"

function invalidateNotebookCaches(userId: string, notebookId: string) {
  updateTag(cacheTags.userNotebook(userId, notebookId))
  updateTag(cacheTags.userNotebooks(userId))
  updateTag(cacheTags.userAnalytics(userId))
}

export const updateNotebookEffect = Effect.fn("updateNotebook")(function* (input: {
  userId: string
  notebookId: string
  title?: string
  description?: string | null
}) {
  try {
    const row = updateNotebookForUser(input.userId, input.notebookId, {
      title: input.title,
      description: input.description,
    })

    invalidateNotebookCaches(input.userId, input.notebookId)

    return {
      notebook: mapNotebookSummary({
        id: row.id,
        title: row.title,
        description: row.description,
        color: row.color,
        tags: row.tags,
        updatedAt: row.updatedAt,
      }),
    }
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Notebook", id: input.notebookId })
    )
  }
})

export const deleteNotebookEffect = Effect.fn("deleteNotebook")(function* (input: {
  userId: string
  notebookId: string
}) {
  try {
    const result = deleteNotebookForUser(input.userId, input.notebookId)

    invalidateNotebookCaches(input.userId, input.notebookId)

    return result
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Notebook", id: input.notebookId })
    )
  }
})

export const deleteAllNotebooksEffect = Effect.fn("deleteAllNotebooks")(
  function* (input: { userId: string }) {
    const result = deleteAllNotebooksForUser(input.userId)

    updateTag(cacheTags.userNotebooks(input.userId))
    updateTag(cacheTags.userAnalytics(input.userId))

    return result
  }
)
