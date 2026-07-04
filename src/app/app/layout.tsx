import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { AppLayout } from "@/components/layout/AppLayout"
import { AppPageSkeleton } from "@/components/feedback/AppPageSkeleton"
import { getCachedSidebarNotebooks } from "@/lib/cached-data"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Suspense
      fallback={
        <AppLayout recentNotebooks={[]}>
          <AppPageSkeleton />
        </AppLayout>
      }
    >
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}

async function AppLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const recentNotebooks = userId
    ? await getCachedSidebarNotebooks(userId)
    : []

  return <AppLayout recentNotebooks={recentNotebooks}>{children}</AppLayout>
}
