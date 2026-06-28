import { Data } from "effect"

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resource: string
  readonly id?: string
}> {
  get message() {
    return this.id
      ? `${this.resource} not found: ${this.id}`
      : `${this.resource} not found`
  }
}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message?: string
}> {
  get displayMessage() {
    return this.message ?? "Unauthorized"
  }
}

export type AppError = NotFoundError | UnauthorizedError
