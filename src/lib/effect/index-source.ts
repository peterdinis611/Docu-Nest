import { Effect } from "effect"
import { indexSourceById } from "@/lib/ai/index-source"

export const indexSourceEffect = Effect.fn("indexSource")(function* (sourceId: string) {
  return yield* Effect.promise(() => indexSourceById(sourceId))
})
