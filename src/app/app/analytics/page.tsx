import { auth } from "@clerk/nextjs/server"
import { AnalyticsPage } from "@/views/AnalyticsPage"
import { EMPTY_ANALYTICS } from "@/lib/analytics"
import { getAnalyticsForUser } from "@/lib/analytics-service"

export default async function Page() {
  const { userId } = await auth()
  const data = userId ? getAnalyticsForUser(userId) : EMPTY_ANALYTICS

  return <AnalyticsPage data={data} />
}
