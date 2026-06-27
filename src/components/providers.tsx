"use client"

import { GlobalSearchDialog } from "@/components/dialogs/GlobalSearchDialog"
import { useSearchShortcut } from "@/hooks/useSearch"

function GlobalSearchMount() {
  useSearchShortcut()
  return <GlobalSearchDialog />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalSearchMount />
      {children}
    </>
  )
}
