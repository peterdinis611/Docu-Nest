import { Effect } from "effect"
import { updateTag } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/db/index"
import { sources } from "@/db/schema"
import {
  createSourceForNotebook,
  deleteSourceForNotebook,
  updateSourceForNotebook,
} from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { indexSourceEffect } from "@/lib/effect/index-source"
import { NotFoundError } from "@/lib/effect/errors"
import { mapSourceDocument } from "@/lib/notebook-mappers"
import type { SourceDocument } from "@/types"

function invalidateSourceCaches(userId: string, notebookId: string) {
  updateTag(cacheTags.userNotebook(userId, notebookId))
  updateTag(cacheTags.userNotebooks(userId))
  updateTag(cacheTags.userAnalytics(userId))
}

function getSourceRow(sourceId: string) {
  return db.select().from(sources).where(eq(sources.id, sourceId)).get()!
}

export const createAndIndexSourceEffect = Effect.fn("createAndIndexSource")(
  function* (input: {
    userId: string
    notebookId: string
    id: string
    title: string
    type: "pdf" | "article" | "note" | "webpage"
    description?: string
    uploadthingFileId?: string
    fileUrl?: string
    sourceUrl?: string
    mimeType?: string
    originalName?: string
    fileSize?: number
    extractedText?: string
    pageCount?: number
  }) {
    const row = createSourceForNotebook(input.userId, {
      id: input.id,
      notebookId: input.notebookId,
      title: input.title,
      type: input.type,
      description: input.description,
      uploadthingFileId: input.uploadthingFileId,
      fileUrl: input.fileUrl,
      sourceUrl: input.sourceUrl,
      mimeType: input.mimeType,
      originalName: input.originalName,
      fileSize: input.fileSize,
      extractedText: input.extractedText,
      pageCount: input.pageCount,
      indexStatus: "pending",
    })

    invalidateSourceCaches(input.userId, input.notebookId)

    try {
      yield* indexSourceEffect(row.id)
    } catch (error) {
      console.error("[sources] indexing failed after create:", error)
    }

    return { source: mapSourceDocument(getSourceRow(row.id)) }
  }
)

export const updateSourceEffect = Effect.fn("updateSource")(function* (input: {
  userId: string
  notebookId: string
  sourceId: string
  title?: string
  description?: string
  enabled?: boolean
  reindex?: boolean
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

    if (input.reindex) {
      try {
        yield* indexSourceEffect(input.sourceId)
      } catch (error) {
        console.error("[sources] reindex failed after update:", error)
      }
    }

    const source: SourceDocument = mapSourceDocument(
      input.reindex ? getSourceRow(input.sourceId) : row
    )
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
