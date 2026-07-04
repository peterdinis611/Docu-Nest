"use server"

import { updateTag } from "next/cache"
import { z } from "zod"
import { createSourceForNotebook } from "@/db/queries"
import {
  deleteSourceEffect,
  runServerEffect,
  updateSourceEffect,
} from "@/lib/effect"
import { cacheTags } from "@/lib/cache-tags"
import { mapSourceDocument } from "@/lib/notebook-mappers"
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

export const createSourceFromUploadAction = authActionClient
  .inputSchema(createSourceFromUploadSchema)
  .action(
    async ({
      parsedInput: {
        notebookId,
        uploadthingFileId,
        fileUrl,
        originalName,
        mimeType,
        fileSize,
      },
      ctx: { userId },
    }) => {
      const row = createSourceForNotebook(userId, {
        id: crypto.randomUUID(),
        notebookId,
        title: titleFromFileName(originalName),
        type: inferDocumentType(originalName, mimeType),
        uploadthingFileId,
        fileUrl,
        mimeType,
        originalName,
        fileSize,
      })

      updateTag(cacheTags.userNotebook(userId, notebookId))
      updateTag(cacheTags.userNotebooks(userId))
      updateTag(cacheTags.userAnalytics(userId))

      return mapSourceDocument(row)
    }
  )

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
