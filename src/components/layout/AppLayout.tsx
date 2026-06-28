"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PanelLeft, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SidebarNotebook {
  id: string
  title: string
  color: string
}

const STORAGE_KEY = "docunest-sidebar-open"

function getInitialOpen() {
  if (typeof window === "undefined") return true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "true") return true
  if (stored === "false") return false
  return true
}

export function AppLayout({
  children,
  recentNotebooks = [],
}: {
  children: React.ReactNode
  recentNotebooks?: SidebarNotebook[]
}) {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialOpen)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarOpen))
  }, [sidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div
        className={cn(
          "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
          sidebarOpen ? "w-[260px]" : "w-0"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} notebooks={recentNotebooks} />
      </div>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {!sidebarOpen && (
          <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="size-8 shrink-0"
            >
              <PanelLeft className="size-4" />
            </Button>
            <Link href="/app" className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex size-7 items-center justify-center rounded-md border bg-muted">
                <Sparkles className="size-3.5 text-foreground" />
              </div>
              DocuNest
            </Link>
          </header>
        )}

        <div className="relative min-h-0 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
