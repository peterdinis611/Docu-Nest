import { Effect } from "effect"
import type { AppError } from "./errors"

export function runServerEffect<A>(effect: Effect.Effect<A, AppError, never>) {
  return Effect.runPromise(
    effect.pipe(
      Effect.catchAll((error) =>
        Effect.sync(() => {
          throw new Error(
            error._tag === "UnauthorizedError"
              ? error.displayMessage
              : error.message
          )
        })
      )
    )
  )
}
