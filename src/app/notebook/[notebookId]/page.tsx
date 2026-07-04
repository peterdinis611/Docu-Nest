import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { NotebookPageSkeleton } from "@/components/feedback/NotebookPageSkeleton"
import { getCachedNotebookPageData } from "@/lib/cached-data"
import { NotebookPage } from "@/views/NotebookPage"

export default function Page({
  params,
}: {
  params: Promise<{ notebookId: string }>
}) {
  return (
    <Suspense fallback={<NotebookPageSkeleton />}>
      <NotebookPageContent params={params} />
    </Suspense>
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
