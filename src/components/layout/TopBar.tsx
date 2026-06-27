"use client"

import Link from "next/link"
import {
  ChevronDown,
  Home,
  PanelLeft,
  PanelRight,
  Share2,
  Search,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ShareNotebookDialog } from "@/components/dialogs/ShareNotebookDialog"
import { useSearch } from "@/hooks/useSearch"
import { cn } from "@/lib/utils"
import type { Notebook } from "@/types"

interface TopBarProps {
  notebook?: Notebook
  notebooks: Notebook[]
  enabledCount: number
  totalSources: number
  sourcesPanelOpen: boolean
  studioPanelOpen: boolean
  onSelectNotebook: (id: string) => void
  onToggleSources: () => void
  onToggleStudio: () => void
}

export function TopBar({
  notebook,
  notebooks,
  enabledCount,
  totalSources,
  sourcesPanelOpen,
  studioPanelOpen,
  onSelectNotebook,
  onToggleSources,
  onToggleStudio,
}: TopBarProps) {
  const { openSearch } = useSearch()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/app">
            <Home className="size-4" />
          </Link>
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSources}
          className={cn(
            "size-8",
            sourcesPanelOpen
              ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Toggle sources panel"
        >
          <PanelLeft className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 max-w-[240px] gap-2 px-2.5 font-medium"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <span className="truncate">
                {notebook?.title ?? "Select notebook"}
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {notebooks.map((nb) => (
              <DropdownMenuItem
                key={nb.id}
                onClick={() => onSelectNotebook(nb.id)}
                className="flex flex-col items-start gap-0.5 py-2.5"
              >
                <span className="font-medium">{nb.title}</span>
                <span className="text-xs text-muted-foreground">
                  {nb.sourceCount} sources · {nb.messageCount} messages
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app" className="text-primary">
                View all notebooks
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="hidden h-6 gap-1 font-normal tabular-nums sm:inline-flex"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {enabledCount}/{totalSources} sources
        </Badge>

        <ShareNotebookDialog
          notebookTitle={notebook?.title}
          trigger={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Share2 className="size-3.5" />
              Share
            </Button>
          }
        />

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={openSearch}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleStudio}
          className={cn(
            "size-8",
            studioPanelOpen
              ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Toggle studio panel"
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
    </header>
  )
}
