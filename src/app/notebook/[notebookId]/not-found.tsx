import Link from "next/link"
import { StatusPage } from "@/components/feedback/StatusPage"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Notebook not found"
      description="This notebook may have been deleted, or you may not have access to it."
      icon="book-x"
      variant="fullscreen"
      actions={
        <>
          <Button asChild>
            <Link href="/app">All notebooks</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/app/library">Browse library</Link>
          </Button>
        </>
      }
    />
  )
}
