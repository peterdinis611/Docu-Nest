"use client"

import { AppShell } from "@/components/layout/AppShell"
import { useNotebook } from "@/hooks/useNotebook"
import type { NotebookPageData } from "@/types"

interface NotebookPageProps {
  data: NotebookPageData
}

export function NotebookPage({ data }: NotebookPageProps) {
  const notebook = useNotebook(data)

  return <AppShell notebook={notebook} />
}
