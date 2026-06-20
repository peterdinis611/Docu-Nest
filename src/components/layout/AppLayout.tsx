import { useEffect, useState } from "react"
import { Link, Outlet } from "react-router-dom"
import { PanelLeft, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "docunest-sidebar-open"

function getInitialOpen() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "true") return true
  if (stored === "false") return false
  return true
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialOpen)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarOpen))
  }, [sidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div
        className={cn(
          "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
          sidebarOpen ? "w-[260px]" : "w-0"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />

        {/* Compact top bar when sidebar is hidden */}
        {!sidebarOpen && (
          <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="size-8 shrink-0"
            >
              <PanelLeft className="size-4" />
            </Button>
            <Link to="/app" className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                <Sparkles className="size-3.5 text-primary-foreground" />
              </div>
              DocuNest
            </Link>
          </header>
        )}

        <div className="relative min-h-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
