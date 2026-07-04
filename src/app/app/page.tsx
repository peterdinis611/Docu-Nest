import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { AppPageSkeleton } from "@/components/feedback/AppPageSkeleton"
import { HomePage } from "@/views/HomePage"
import {
  getCachedNotebooksForUser,
  getCachedRecentActivityForUser,
} from "@/lib/cached-data"

export default function Page() {
  return (
    <Suspense fallback={<AppPageSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}

async function HomePageContent() {
  const { userId } = await auth()
  const [notebooks, activity] = userId
    ? await Promise.all([
        getCachedNotebooksForUser(userId),
        getCachedRecentActivityForUser(userId),
      ])
    : [[], []]

  return <HomePage notebooks={notebooks} activity={activity} />
}
