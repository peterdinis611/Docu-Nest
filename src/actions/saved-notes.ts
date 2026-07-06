"use server"

import { z } from "zod"
import {
  createSavedNoteEffect,
  deleteSavedNoteEffect,
  runServerEffect,
  updateSavedNoteEffect,
} from "@/lib/effect"
import { authActionClient } from "@/lib/safe-action"

const notebookIdSchema = z.object({
  notebookId: z.string().min(1),
})

const createSavedNoteSchema = notebookIdSchema.extend({
  title: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1).max(100_000),
})

const updateSavedNoteSchema = notebookIdSchema.extend({
  noteId: z.string().min(1),
  title: z.string().trim().min(1).max(255).optional(),
  body: z.string().trim().min(1).max(100_000).optional(),
})

const deleteSavedNoteSchema = notebookIdSchema.extend({
  noteId: z.string().min(1),
})

export const createSavedNoteAction = authActionClient
  .inputSchema(createSavedNoteSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      createSavedNoteEffect({
        userId,
        notebookId: parsedInput.notebookId,
        title: parsedInput.title,
        body: parsedInput.body,
      })
    )
  )

export const updateSavedNoteAction = authActionClient
  .inputSchema(updateSavedNoteSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      updateSavedNoteEffect({
        userId,
        notebookId: parsedInput.notebookId,
        noteId: parsedInput.noteId,
        title: parsedInput.title,
        body: parsedInput.body,
      })
    )
  )

export const deleteSavedNoteAction = authActionClient
  .inputSchema(deleteSavedNoteSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      deleteSavedNoteEffect({
        userId,
        notebookId: parsedInput.notebookId,
        noteId: parsedInput.noteId,
      })
    )
  )
