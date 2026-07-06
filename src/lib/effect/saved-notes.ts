import { Effect } from "effect"
import { updateTag } from "next/cache"
import {
  createSavedNoteForNotebook,
  deleteSavedNoteForNotebook,
  updateSavedNoteForNotebook,
} from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { NotFoundError } from "@/lib/effect/errors"
import { mapSavedNote } from "@/lib/notebook-mappers"
import { excerptFromText } from "@/lib/text-extraction"

function invalidateNotebook(userId: string, notebookId: string) {
  updateTag(cacheTags.userNotebook(userId, notebookId))
  updateTag(cacheTags.userNotebooks(userId))
}

export const createSavedNoteEffect = Effect.fn("createSavedNote")(function* (input: {
  userId: string
  notebookId: string
  title: string
  body: string
}) {
  try {
    const id = crypto.randomUUID()
    const row = createSavedNoteForNotebook(input.userId, {
      id,
      notebookId: input.notebookId,
      title: input.title.trim(),
      excerpt: excerptFromText(input.body, 160),
      body: input.body.trim(),
    })

    invalidateNotebook(input.userId, input.notebookId)

    return { note: mapSavedNote(row) }
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Notebook", id: input.notebookId })
    )
  }
})

export const updateSavedNoteEffect = Effect.fn("updateSavedNote")(function* (input: {
  userId: string
  notebookId: string
  noteId: string
  title?: string
  body?: string
}) {
  try {
    const row = updateSavedNoteForNotebook(input.userId, {
      notebookId: input.notebookId,
      noteId: input.noteId,
      title: input.title?.trim(),
      body: input.body?.trim(),
      excerpt: input.body ? excerptFromText(input.body, 160) : undefined,
    })

    invalidateNotebook(input.userId, input.notebookId)

    return { note: mapSavedNote(row) }
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "SavedNote", id: input.noteId })
    )
  }
})

export const deleteSavedNoteEffect = Effect.fn("deleteSavedNote")(function* (input: {
  userId: string
  notebookId: string
  noteId: string
}) {
  try {
    const result = deleteSavedNoteForNotebook(
      input.userId,
      input.notebookId,
      input.noteId
    )

    invalidateNotebook(input.userId, input.notebookId)

    return result
  } catch {
    return yield* Effect.fail(
      new NotFoundError({ resource: "SavedNote", id: input.noteId })
    )
  }
})
