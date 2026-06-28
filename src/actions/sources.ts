"use server"

import { updateTag } from "next/cache"
import { z } from "zod"
import { createSourceForNotebook } from "@/db/queries"
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
