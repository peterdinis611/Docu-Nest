"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
  BarChart3,
  BookOpen,
  FileText,
  FolderOpen,
  Home,
  Loader2,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { globalSearchAction } from "@/actions/search"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchEmptyState } from "@/components/search/SearchEmptyState"
import { SearchResultList } from "@/components/search/SearchResultList"
import { useSearch } from "@/hooks/useSearch"
import type { SearchItem, SearchItemKind } from "@/lib/search-index"

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

  const { execute, result, isExecuting, hasErrored, reset } = useAction(
    globalSearchAction,
    {
      onError: ({ error }) => {
        toast.error(
          typeof error.serverError === "string"
            ? error.serverError
            : "Search failed. Please try again."
        )
      },
    }
  )

  useEffect(() => {
    if (!open) {
      reset()
      return
    }

    const delay = query.trim() ? 200 : 0
    const timer = window.setTimeout(() => {
      execute({ query })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [open, query, execute, reset])

  const results = result.data?.items ?? []
  const showLoading = open && isExecuting && results.length === 0
  const showEmpty =
    open && !isExecuting && (hasErrored || results.length === 0)
  const emptyVariant = hasErrored
    ? "error"
    : query.trim()
      ? "empty"
      : "idle"

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
          <AnimatePresence mode="wait" initial={false}>
            {isExecuting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
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

        <AnimatePresence mode="popLayout" initial={false}>
          {showLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </motion.div>
          ) : showEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SearchEmptyState variant={emptyVariant} query={query} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SearchResultList
                results={results}
                kindOrder={kindOrder}
                activeIndex={activeIndex}
                getItemIcon={getItemIcon}
                onSelect={selectItem}
                onActiveIndexChange={setActiveIndex}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
