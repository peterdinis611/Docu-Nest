import { auth } from "@clerk/nextjs/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { z } from "zod"

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
      return {
        notebookId: metadata.notebookId,
        uploadthingFileId: file.key,
        fileUrl: file.url,
        originalName: file.name,
        mimeType: file.type || null,
        fileSize: file.size,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
