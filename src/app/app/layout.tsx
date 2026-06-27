import { auth } from "@clerk/nextjs/server"
import { AppLayout } from "@/components/layout/AppLayout"
import { listNotebooksForUser } from "@/db/queries"

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId } = await auth()
  const recentNotebooks = userId
    ? listNotebooksForUser(userId, 4).map((nb) => ({
        id: nb.id,
        title: nb.title,
        color: nb.color,
      }))
    : []

  return <AppLayout recentNotebooks={recentNotebooks}>{children}</AppLayout>
}
