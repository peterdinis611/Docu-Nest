"use client"

import { GlobalSearchDialog } from "@/components/dialogs/GlobalSearchDialog"
import { Toaster } from "@/components/ui/sonner"
import { useSearchShortcut } from "@/hooks/useSearch"

function GlobalSearchMount() {
  useSearchShortcut()
  return <GlobalSearchDialog />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster richColors closeButton position="bottom-right" />
      <GlobalSearchMount />
      {children}
    </>
  )
}
