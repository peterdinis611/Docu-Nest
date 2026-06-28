import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { HomePage } from "@/views/HomePage"
import { getCachedNotebooksForUser } from "@/lib/cached-data"

export default function Page() {
  return (
    <Suspense fallback={<HomePage notebooks={[]} />}>
      <HomePageContent />
    </Suspense>
  )
}

async function HomePageContent() {
  const { userId } = await auth()
  const notebooks = userId ? await getCachedNotebooksForUser(userId) : []

  return <HomePage notebooks={notebooks} />
}
