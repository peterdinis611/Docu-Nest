import { auth } from "@clerk/nextjs/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { createSourceForNotebook } from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { mapSourceDocument } from "@/lib/notebook-mappers"
import { inferDocumentType, titleFromFileName } from "@/lib/source-utils"

const f = createUploadthing()

export const ourFileRouter = {
  notebookSourceUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    text: { maxFileSize: "4MB", maxFileCount: 10 },
    blob: { maxFileSize: "32MB", maxFileCount: 10 },
  })
    .input(z.object({ notebookId: z.string().min(1) }))
    .middleware(async ({ input }) => {
      const { userId } = await auth()

      if (!userId) {
        throw new UploadThingError("Unauthorized")
      }

      return { userId, notebookId: input.notebookId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const sourceId = crypto.randomUUID()
      const originalName = file.name

      const row = createSourceForNotebook(metadata.userId, {
        id: sourceId,
        notebookId: metadata.notebookId,
        title: titleFromFileName(originalName),
        type: inferDocumentType(originalName, file.type),
        fileKey: file.key,
        fileUrl: file.url,
        mimeType: file.type || undefined,
        originalName,
      })

      revalidateTag(cacheTags.userNotebook(metadata.userId, metadata.notebookId), "max")
      revalidateTag(cacheTags.userNotebooks(metadata.userId), "max")
      revalidateTag(cacheTags.userAnalytics(metadata.userId), "max")

      const source = mapSourceDocument(row)

      return {
        source: {
          id: source.id,
          title: source.title,
          type: source.type,
          description: source.description,
          pageCount: source.pageCount ?? null,
          uploadedAt: source.uploadedAt,
          enabled: source.enabled,
          fileKey: source.fileKey ?? null,
          fileUrl: source.fileUrl ?? null,
          mimeType: source.mimeType ?? null,
          originalName: source.originalName ?? null,
        },
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
