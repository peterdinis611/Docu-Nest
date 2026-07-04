"use client"

import { RouteErrorPage } from "@/components/feedback/RouteErrorPage"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <RouteErrorPage
          error={error}
          reset={reset}
          title="Application error"
          description="DocuNest hit an unexpected error. You can retry or return to the home page."
          variant="fullscreen"
          homeHref="/"
        />
      </body>
    </html>
  )
}
