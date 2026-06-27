"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  FileText,
  FolderOpen,
  Home,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSearch } from "@/hooks/useSearch"
import { createFuseIndex, searchFuse } from "@/hooks/useFuseSearch"
import {
  buildGlobalSearchIndex,
  globalSearchFuseOptions,
  type SearchItem,
  type SearchItemKind,
} from "@/lib/search-index"
import { cn } from "@/lib/utils"

const kindLabels: Record<SearchItemKind, string> = {
  page: "Pages",
  notebook: "Notebooks",
  document: "Documents",
}

const kindOrder: SearchItemKind[] = ["page", "notebook", "document"]

const itemIcons: Record<string, LucideIcon> = {
  "page-home": Home,
  "page-library": FolderOpen,
  "page-analytics": BarChart3,
  "page-settings": Settings,
}

const fallbackIcons: Record<SearchItemKind, LucideIcon> = {
  page: Home,
  notebook: BookOpen,
  document: FileText,
}

function getItemIcon(item: SearchItem) {
  return itemIcons[item.id] ?? fallbackIcons[item.kind]
}

export function GlobalSearchDialog() {
  const { open, closeSearch } = useSearch()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const index = useMemo(() => buildGlobalSearchIndex(), [])
  const fuse = useMemo(
    () => createFuseIndex(index, globalSearchFuseOptions),
    [index]
  )

  const results = useMemo(
    () => searchFuse(fuse, query, index),
    [fuse, query, index]
  )

  const grouped = useMemo(() => {
    const groups: Partial<Record<SearchItemKind, SearchItem[]>> = {}
    for (const item of results) {
      groups[item.kind] ??= []
      groups[item.kind]!.push(item)
    }
    return groups
  }, [results])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      closeSearch()
      setQuery("")
      setActiveIndex(0)
    }
  }

  const selectItem = (item: SearchItem) => {
    router.push(item.href)
    closeSearch()
    setQuery("")
    setActiveIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault()
      selectItem(results[activeIndex])
    }
  }

  let runningIndex = -1

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose
        className="gap-0 overflow-hidden border-border/80 bg-popover p-0 text-popover-foreground shadow-2xl sm:max-w-lg"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search notebooks, documents, and pages
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search notebooks, sources, pages…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {query.trim() ? "No results found" : "Start typing to search…"}
            </p>
          ) : (
            kindOrder.map((kind) => {
              const items = grouped[kind]
              if (!items?.length) return null

              return (
                <div key={kind} className="mb-1 last:mb-0">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {kindLabels[kind]}
                  </p>
                  {items.map((item) => {
                    runningIndex += 1
                    const itemIndex = runningIndex
                    const isActive = itemIndex === activeIndex
                    const Icon = getItemIcon(item)

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50",
                            isActive && "border-primary/20 bg-primary/10"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4 text-muted-foreground",
                              isActive && "text-primary"
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
