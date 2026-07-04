"use server"

import { z } from "zod"
import { clearChatEffect, runServerEffect, sendChatMessageEffect } from "@/lib/effect"
import { authActionClient } from "@/lib/safe-action"

const sendChatMessageSchema = z.object({
  notebookId: z.string().min(1),
  content: z.string().min(1),
  userMessageId: z.string().min(1),
  documentId: z.string().optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
})

export const sendChatMessageAction = authActionClient
  .inputSchema(sendChatMessageSchema)
  .action(async ({ parsedInput, ctx: { userId } }) =>
    runServerEffect(
      sendChatMessageEffect({
        userId,
        notebookId: parsedInput.notebookId,
        content: parsedInput.content,
        userMessageId: parsedInput.userMessageId,
        documentId: parsedInput.documentId,
        history: parsedInput.history,
      })
    )
  )

export const clearChatAction = authActionClient
  .inputSchema(z.object({ notebookId: z.string().min(1) }))
  .action(async ({ parsedInput: { notebookId }, ctx: { userId } }) =>
    runServerEffect(clearChatEffect({ userId, notebookId }))
  )
