"use client"

import Link from "next/link"
import { useEffect } from "react"
import { StatusPage } from "@/components/feedback/StatusPage"
import { Button } from "@/components/ui/button"

interface RouteErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  homeHref?: string
  variant?: "embedded" | "fullscreen"
}

export function RouteErrorPage({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Try again or return to the dashboard.",
  homeHref = "/app",
  variant = "embedded",
}: RouteErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPage
      code="500"
      title={title}
      description={description}
      icon="alert-triangle"
      variant={variant}
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href={homeHref}>Back to home</Link>
          </Button>
        </>
      }
    />
  )
}
