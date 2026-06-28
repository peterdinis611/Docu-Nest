"use server"

import { z } from "zod"
import { generateStudioOutputEffect, runServerEffect } from "@/lib/effect"
import { authActionClient } from "@/lib/safe-action"

const generateStudioOutputSchema = z.object({
  notebookId: z.string().min(1),
  outputType: z.enum([
    "audio-overview",
    "study-guide",
    "briefing-doc",
    "faq",
    "timeline",
    "mind-map",
    "flashcards",
  ]),
})

export const generateStudioOutputAction = authActionClient
  .inputSchema(generateStudioOutputSchema)
  .action(async ({ parsedInput: { notebookId, outputType }, ctx: { userId } }) =>
    runServerEffect(
      generateStudioOutputEffect({ userId, notebookId, outputType })
    )
  )
