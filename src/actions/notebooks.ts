"use server"

import { updateTag } from "next/cache"
import { z } from "zod"
import { createNotebookForUser } from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { pickNotebookColor } from "@/lib/notebook-colors"
import { authActionClient } from "@/lib/safe-action"

const createNotebookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or less"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .optional(),
})

export const createNotebookAction = authActionClient
  .inputSchema(createNotebookSchema)
  .action(async ({ parsedInput: { title, description }, ctx: { userId } }) => {
    const id = crypto.randomUUID()
    const notebook = createNotebookForUser(userId, {
      id,
      title,
      description,
      color: pickNotebookColor(),
    })

    updateTag(cacheTags.userNotebooks(userId))
    updateTag(cacheTags.userAnalytics(userId))
    updateTag(cacheTags.userNotebook(userId, notebook.id))

    return {
      id: notebook.id,
      title: notebook.title,
    }
  })
