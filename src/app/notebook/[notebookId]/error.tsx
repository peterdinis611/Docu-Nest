"use client"

import { RouteErrorPage } from "@/components/feedback/RouteErrorPage"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorPage
      error={error}
      reset={reset}
      title="Couldn't load notebook"
      description="Something went wrong while opening this notebook. Try again or go back to your dashboard."
      variant="fullscreen"
    />
  )
}
