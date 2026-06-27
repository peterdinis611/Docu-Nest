"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  FileText,
  Home,
  Search,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/hooks/useSearch"
import { createFuseIndex, searchFuse } from "@/hooks/useFuseSearch"
import {
  buildGlobalSearchIndex,
  globalSearchFuseOptions,
  type SearchItem,
  type SearchItemKind,
} from "@/lib/search-index"
import { cn } from "@/lib/utils"

const kindIcons: Record<SearchItemKind, typeof Home> = {
  page: Home,
  notebook: BookOpen,
  document: FileText,
}

const kindLabels: Record<SearchItemKind, string> = {
  page: "Pages",
  notebook: "Notebooks",
  document: "Documents",
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

  const flatResults = results

  const selectItem = (item: SearchItem) => {
    router.push(item.href)
    closeSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault()
      selectItem(flatResults[activeIndex])
    }
  }

  let runningIndex = -1

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search notebooks, documents, and pages
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search notebooks, sources, pages…"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {flatResults.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {query.trim() ? "No results found" : "Start typing to search…"}
            </p>
          ) : (
            (Object.keys(grouped) as SearchItemKind[]).map((kind) => {
              const items = grouped[kind]
              if (!items?.length) return null
              const Icon = kindIcons[kind]

              return (
                <div key={kind} className="mb-2">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {kindLabels[kind]}
                  </p>
                  {items.map((item) => {
                    runningIndex += 1
                    const itemIndex = runningIndex
                    const isActive = itemIndex === activeIndex

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isActive ? "bg-accent" : "hover:bg-accent/60"
                        )}
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="size-4 text-muted-foreground" />
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

        <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ navigate · ↵ open</span>
          <span>{flatResults.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

