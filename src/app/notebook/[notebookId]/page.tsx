import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { getNotebookById, listNotebooksForUser } from "@/db/queries"
import {
  mapChatMessage,
  mapNotebookSummary,
  mapSavedNote,
  mapSourceDocument,
  mapStudioOutput,
} from "@/lib/notebook-mappers"
import { NotebookPage } from "@/views/NotebookPage"
import type { NotebookPageData } from "@/types"

export default async function Page({
  params,
}: {
  params: Promise<{ notebookId: string }>
}) {
  const { notebookId } = await params
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const record = getNotebookById(notebookId, userId)

  if (!record) {
    notFound()
  }

  const summaries = listNotebooksForUser(userId)

  const data: NotebookPageData = {
    notebook: mapNotebookSummary({
      id: record.id,
      title: record.title,
      description: record.description,
      color: record.color,
      tags: record.tags,
      updatedAt: record.updatedAt,
      sourceCount: record.sources.length,
      messageCount: record.messages.length,
    }),
    notebooks: summaries.map(mapNotebookSummary),
    documents: record.sources.map(mapSourceDocument),
    messages: record.messages.map(mapChatMessage),
    savedNotes: record.savedNotes.map(mapSavedNote),
    studioOutputs: record.studioOutputs.map(mapStudioOutput),
  }

  return <NotebookPage data={data} />
}
