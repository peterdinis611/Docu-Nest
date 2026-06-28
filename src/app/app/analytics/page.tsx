import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { AnalyticsPage } from "@/views/AnalyticsPage"
import { EMPTY_ANALYTICS } from "@/lib/analytics"
import { getCachedAnalyticsForUser } from "@/lib/cached-data"

export default function Page() {
  return (
    <Suspense fallback={<AnalyticsPage data={EMPTY_ANALYTICS} />}>
      <AnalyticsPageContent />
    </Suspense>
  )
}

async function AnalyticsPageContent() {
  const { userId } = await auth()
  const data = userId
    ? await getCachedAnalyticsForUser(userId)
    : EMPTY_ANALYTICS

  return <AnalyticsPage data={data} />
}
