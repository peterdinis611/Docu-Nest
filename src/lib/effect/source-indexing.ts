import { Effect } from "effect"
import { indexSourceById } from "@/lib/ai/index-source"
import { mapSourceDocument } from "@/lib/notebook-mappers"

export const indexSourceEffect = Effect.fn("indexSource")(function* (sourceId: string) {
  yield* Effect.promise(() => indexSourceById(sourceId))

  const { db } = yield* Effect.promise(() => import("@/db/index"))
  const { sources } = yield* Effect.promise(() => import("@/db/schema"))
  const { eq } = yield* Effect.promise(() => import("drizzle-orm"))

  const row = db.select().from(sources).where(eq(sources.id, sourceId)).get()

  if (!row) {
    throw new Error("Source not found after indexing")
  }

  return mapSourceDocument(row)
})
