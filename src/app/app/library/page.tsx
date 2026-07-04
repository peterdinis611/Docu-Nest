import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { LibraryPage } from "@/views/LibraryPage"
import { getCachedLibraryDocumentsForUser } from "@/lib/cached-data"

export default function Page() {
  return (
    <Suspense fallback={<LibraryPage documents={[]} />}>
      <LibraryPageContent />
    </Suspense>
  )
}

async function LibraryPageContent() {
  const { userId } = await auth()
  const documents = userId ? await getCachedLibraryDocumentsForUser(userId) : []

  return <LibraryPage documents={documents} />
}
