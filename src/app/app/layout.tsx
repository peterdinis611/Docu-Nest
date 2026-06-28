import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { AppLayout } from "@/components/layout/AppLayout"
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
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          </div>
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
