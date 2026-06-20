import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { useNotebook } from "@/hooks/useNotebook"

export function NotebookPage() {
  const { notebookId } = useParams()
  const notebook = useNotebook()

  useEffect(() => {
    if (notebookId) {
      notebook.selectNotebook(notebookId)
    }
  }, [notebookId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <AppShell notebook={notebook} />
}
