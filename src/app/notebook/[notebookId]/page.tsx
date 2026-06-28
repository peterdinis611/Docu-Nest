import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { getCachedNotebookPageData } from "@/lib/cached-data"
import { NotebookPage } from "@/views/NotebookPage"

export default function Page({
  params,
}: {
  params: Promise<{ notebookId: string }>
}) {
  return (
    <Suspense fallback={<NotebookPageFallback />}>
      <NotebookPageContent params={params} />
    </Suspense>
  )
}

function NotebookPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  )
}

async function NotebookPageContent({
  params,
}: {
  params: Promise<{ notebookId: string }>
}) {
  const { notebookId } = await params
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const data = await getCachedNotebookPageData(userId, notebookId)

  if (!data) {
    notFound()
  }

  return <NotebookPage data={data} />
}
