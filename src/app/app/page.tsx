import { auth } from "@clerk/nextjs/server"
import { listNotebooksForUser } from "@/db/queries"
import { mapNotebookSummary } from "@/lib/notebook-mappers"
import { HomePage } from "@/views/HomePage"

export default async function Page() {
  const { userId } = await auth()
  const notebooks = userId
    ? listNotebooksForUser(userId).map(mapNotebookSummary)
    : []

  return <HomePage notebooks={notebooks} />
}
