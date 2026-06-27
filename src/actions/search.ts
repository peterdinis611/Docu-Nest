"use server"

import { z } from "zod"
import { authActionClient } from "@/lib/safe-action"
import { searchGlobalIndex } from "@/lib/search-service"

const globalSearchSchema = z.object({
  query: z.string().max(200),
  limit: z.number().int().min(1).max(50).optional(),
})

export const globalSearchAction = authActionClient
  .inputSchema(globalSearchSchema)
  .action(async ({ parsedInput: { query, limit }, ctx: { userId } }) => {
    const items = searchGlobalIndex(userId, query, limit ?? 50)
    return { items }
  })
