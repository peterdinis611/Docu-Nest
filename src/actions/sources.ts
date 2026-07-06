"use server"

import { updateTag } from "next/cache"
import { z } from "zod"
import {
  createAndIndexSourceEffect,
  deleteSourceEffect,
  runServerEffect,
  updateSourceEffect,
} from "@/lib/effect"
import { cacheTags } from "@/lib/cache-tags"
import { excerptFromText, extractUrlText } from "@/lib/text-extraction"
import { inferDocumentType, titleFromFileName } from "@/lib/source-utils"
import { authActionClient } from "@/lib/safe-action"

const createSourceFromUploadSchema = z.object({
  notebookId: z.string().min(1),
  uploadthingFileId: z.string().min(1),
  fileUrl: z.string().url(),
  originalName: z.string().min(1).max(255),
  mimeType: z.string().max(120).optional(),
  fileSize: z.number().int().positive().optional(),
})

const sourceIdSchema = z.object({
  notebookId: z.string().min(1),
  sourceId: z.string().min(1),
})

const updateSourceSchema = sourceIdSchema.extend({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(2000).optional(),
  enabled: z.boolean().optional(),
})

const createSourceFromPasteSchema = z.object({
  notebookId: z.string().min(1),
  title: z.string().trim().min(1).max(255).optional(),
  text: z.string().trim().min(1).max(500_000),
})

const createSourceFromUrlSchema = z.object({
  notebookId: z.string().min(1),
  url: z.string().url().max(2000),
})

export const createSourceFromUploadAction = authActionClient
  .inputSchema(createSourceFromUploadSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      createAndIndexSourceEffect({
        userId,
        id: crypto.randomUUID(),
        notebookId: parsedInput.notebookId,
        title: titleFromFileName(parsedInput.originalName),
        type: inferDocumentType(parsedInput.originalName, parsedInput.mimeType),
        uploadthingFileId: parsedInput.uploadthingFileId,
        fileUrl: parsedInput.fileUrl,
        mimeType: parsedInput.mimeType,
        originalName: parsedInput.originalName,
        fileSize: parsedInput.fileSize,
      })
    )
  )

export const createSourceFromPasteAction = authActionClient
  .inputSchema(createSourceFromPasteSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const title =
      parsedInput.title?.trim() ||
      excerptFromText(parsedInput.text, 48) ||
      "Pasted note"

    return runServerEffect(
      createAndIndexSourceEffect({
        userId,
        id: crypto.randomUUID(),
        notebookId: parsedInput.notebookId,
        title,
        type: "note",
        description: excerptFromText(parsedInput.text),
        extractedText: parsedInput.text,
      })
    )
  })

export const createSourceFromUrlAction = authActionClient
  .inputSchema(createSourceFromUrlSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const extracted = await extractUrlText(parsedInput.url)

    return runServerEffect(
      createAndIndexSourceEffect({
        userId,
        id: crypto.randomUUID(),
        notebookId: parsedInput.notebookId,
        title: extracted.title ?? parsedInput.url,
        type: "webpage",
        description: excerptFromText(extracted.text),
        sourceUrl: parsedInput.url,
        fileUrl: parsedInput.url,
        extractedText: extracted.text,
      })
    )
  })

export const updateSourceAction = authActionClient
  .inputSchema(updateSourceSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      updateSourceEffect({
        userId,
        notebookId: parsedInput.notebookId,
        sourceId: parsedInput.sourceId,
        title: parsedInput.title,
        description: parsedInput.description,
        enabled: parsedInput.enabled,
        reindex: parsedInput.description !== undefined,
      })
    )
  )

export const toggleSourceEnabledAction = authActionClient
  .inputSchema(
    sourceIdSchema.extend({
      enabled: z.boolean(),
    })
  )
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      updateSourceEffect({
        userId,
        notebookId: parsedInput.notebookId,
        sourceId: parsedInput.sourceId,
        enabled: parsedInput.enabled,
      })
    )
  )

export const deleteSourceAction = authActionClient
  .inputSchema(sourceIdSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      deleteSourceEffect({
        userId,
        notebookId: parsedInput.notebookId,
        sourceId: parsedInput.sourceId,
      })
    )
  )

export const reindexSourceAction = authActionClient
  .inputSchema(sourceIdSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const result = await runServerEffect(
      updateSourceEffect({
        userId,
        notebookId: parsedInput.notebookId,
        sourceId: parsedInput.sourceId,
        reindex: true,
      })
    )

    updateTag(cacheTags.userNotebook(userId, parsedInput.notebookId))

    return result
  })
