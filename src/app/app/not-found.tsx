import Link from "next/link"
import { StatusPage } from "@/components/feedback/StatusPage"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="This page doesn't exist in your workspace."
      icon="file-question"
      actions={
        <>
          <Button asChild>
            <Link href="/app">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/library">Browse library</Link>
          </Button>
        </>
      }
    />
  )
}
