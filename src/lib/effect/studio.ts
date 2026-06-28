import { Effect } from "effect"
import { updateTag } from "next/cache"
import {
  createStudioOutputForNotebook,
  getNotebookById,
} from "@/db/queries"
import { cacheTags } from "@/lib/cache-tags"
import { NotFoundError } from "@/lib/effect/errors"
import { generateStudioContent } from "@/lib/ai/studio"
import { mapSourceDocument, mapStudioOutput } from "@/lib/notebook-mappers"
import type { StudioOutput, StudioOutputType } from "@/types"

export const generateStudioOutputEffect = Effect.fn(
  "generateStudioOutput"
)(function* (input: {
  userId: string
  notebookId: string
  outputType: StudioOutputType
}) {
  const { userId, notebookId, outputType } = input

  const notebook = getNotebookById(notebookId, userId)

  if (!notebook) {
    return yield* Effect.fail(
      new NotFoundError({ resource: "Notebook", id: notebookId })
    )
  }

  const sources = notebook.sources.map(mapSourceDocument)
  const payload = yield* Effect.promise(() =>
    generateStudioContent(outputType, sources, notebook.title)
  )

  const row = createStudioOutputForNotebook(userId, {
    id: crypto.randomUUID(),
    notebookId,
    type: outputType,
    title: payload.title,
    content: payload.content,
    duration: payload.duration,
  })

  updateTag(cacheTags.userNotebook(userId, notebookId))
  updateTag(cacheTags.userAnalytics(userId))

  const output: StudioOutput = mapStudioOutput(row)

  return { output }
})
