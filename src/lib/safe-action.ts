import { createSafeActionClient } from "next-safe-action"
import { auth } from "@clerk/nextjs/server"

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[safe-action]", error)
    return "Something went wrong. Please try again."
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return next({ ctx: { userId } })
})
