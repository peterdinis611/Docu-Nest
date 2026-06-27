"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { useNotebook } from "@/hooks/useNotebook"

export function NotebookPage() {
  const params = useParams()
  const notebookId = params.notebookId as string | undefined
  const notebook = useNotebook()

  useEffect(() => {
    if (notebookId) {
      notebook.selectNotebook(notebookId)
    }
  }, [notebookId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <AppShell notebook={notebook} />
}
