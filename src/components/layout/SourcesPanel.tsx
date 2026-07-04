"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  FileText,
  Globe,
  Link2,
  MessageSquare,
  NotebookPen,
  Plus,
  ScrollText,
  Search,
  Upload,
} from "lucide-react"
import { AddSourceDialog } from "@/components/dialogs/AddSourceDialog"
import { SourceActionsMenu } from "@/components/notebook/SourceActionsMenu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { createFuseIndex, searchFuse } from "@/hooks/useFuseSearch"
import { cn } from "@/lib/utils"
import type { DocumentType, SourceDocument } from "@/types"

const sourceFuseOptions = {
  keys: ["title", "description", "type"],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}

const typeConfig: Record<
  DocumentType,
  { icon: typeof FileText; label: string; color: string }
> = {
  pdf: {
    icon: ScrollText,
    label: "PDF",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  article: {
    icon: FileText,
    label: "Article",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  note: {
    icon: NotebookPen,
    label: "Note",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  webpage: {
    icon: Globe,
    label: "Web",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
}

interface SourcesPanelProps {
  notebookId: string
  documents: SourceDocument[]
  selectedDocumentId: string | null
  chatDocumentId: string | null
  onToggleDocument: (id: string) => void
  onSelectDocument: (id: string | null) => void
  onFocusChatDocument: (id: string) => void
  onSourceAdded: (source: SourceDocument) => void
  onSourceUpdated: (source: SourceDocument) => void
  onSourceDeleted: (sourceId: string) => void
}

export function SourcesPanel({
  notebookId,
  documents,
  selectedDocumentId,
  chatDocumentId,
  onToggleDocument,
  onSelectDocument,
  onFocusChatDocument,
  onSourceAdded,
  onSourceUpdated,
  onSourceDeleted,
}: SourcesPanelProps) {
  const [query, setQuery] = useState("")
  const enabledCount = documents.filter((d) => d.enabled).length

  const fuse = useMemo(
    () => createFuseIndex(documents, sourceFuseOptions),
    [documents]
  )

  const filtered = useMemo(
    () => searchFuse(fuse, query, documents),
    [fuse, query, documents]
  )

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div>
          <h2 className="text-sm font-semibold">Sources</h2>
          <p className="text-[11px] text-muted-foreground">
            {enabledCount} of {documents.length} active
          </p>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {documents.length}
        </Badge>
      </div>

      <div className="space-y-2 px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter sources…"
            className="h-8 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <AddSourceDialog
            notebookId={notebookId}
            onSourceAdded={onSourceAdded}
            trigger={
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
          <AddSourceDialog
            notebookId={notebookId}
            defaultTab="upload"
            onSourceAdded={onSourceAdded}
            trigger={
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Upload className="size-3.5" />
                Upload
              </Button>
            }
          />
        </div>
      </div>

      <VirtualizedSourceList
        notebookId={notebookId}
        sources={filtered}
        selectedDocumentId={selectedDocumentId}
        chatDocumentId={chatDocumentId}
        onToggleDocument={onToggleDocument}
        onSelectDocument={onSelectDocument}
        onFocusChatDocument={onFocusChatDocument}
        onSourceUpdated={onSourceUpdated}
        onSourceDeleted={onSourceDeleted}
        emptyMessage={
          documents.length === 0
            ? "No sources yet. Upload a file to get started."
            : "No sources match your search"
        }
      />
    </aside>
  )
}

interface VirtualizedSourceListProps {
  notebookId: string
  sources: SourceDocument[]
  selectedDocumentId: string | null
  chatDocumentId: string | null
  onToggleDocument: (id: string) => void
  onSelectDocument: (id: string | null) => void
  onFocusChatDocument: (id: string) => void
  onSourceUpdated: (source: SourceDocument) => void
  onSourceDeleted: (sourceId: string) => void
  emptyMessage: string
}

function VirtualizedSourceList({
  notebookId,
  sources,
  selectedDocumentId,
  chatDocumentId,
  onToggleDocument,
  onSelectDocument,
  onFocusChatDocument,
  onSourceUpdated,
  onSourceDeleted,
  emptyMessage,
}: VirtualizedSourceListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: sources.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 6,
  })

  useLayoutEffect(() => {
    virtualizer.measure()
  }, [sources, virtualizer])

  useEffect(() => {
    const el = parentRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      virtualizer.measure()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [virtualizer])

  useEffect(() => {
    if (!selectedDocumentId) return
    const index = sources.findIndex((doc) => doc.id === selectedDocumentId)
    if (index >= 0) {
      virtualizer.scrollToIndex(index, { align: "auto" })
    }
  }, [selectedDocumentId, sources, virtualizer])

  if (sources.length === 0) {
    return (
      <div className="flex flex-1 items-start justify-center px-4 py-8">
        <p className="text-center text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const doc = sources[virtualRow.index]
          if (!doc) return null

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-2"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <SourceListItem
                notebookId={notebookId}
                doc={doc}
                isPreviewing={selectedDocumentId === doc.id}
                isChatFocused={chatDocumentId === doc.id}
                onToggleDocument={onToggleDocument}
                onSelectDocument={onSelectDocument}
                onFocusChatDocument={onFocusChatDocument}
                onSourceUpdated={onSourceUpdated}
                onSourceDeleted={onSourceDeleted}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SourceListItemProps {
  notebookId: string
  doc: SourceDocument
  isPreviewing: boolean
  isChatFocused: boolean
  onToggleDocument: (id: string) => void
  onSelectDocument: (id: string | null) => void
  onFocusChatDocument: (id: string) => void
  onSourceUpdated: (source: SourceDocument) => void
  onSourceDeleted: (sourceId: string) => void
}

function SourceListItem({
  notebookId,
  doc,
  isPreviewing,
  isChatFocused,
  onToggleDocument,
  onSelectDocument,
  onFocusChatDocument,
  onSourceUpdated,
  onSourceDeleted,
}: SourceListItemProps) {
  const config = typeConfig[doc.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "group rounded-xl border p-3 transition-all",
        isPreviewing
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : isChatFocused
            ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm"
            : doc.enabled
              ? "border-border/60 bg-background hover:border-primary/25 hover:shadow-sm"
              : "border-border/40 bg-muted/30 opacity-60"
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={doc.enabled}
          onCheckedChange={() => onToggleDocument(doc.id)}
          className="mt-1"
        />
        <button
          type="button"
          onClick={() => onSelectDocument(isPreviewing ? null : doc.id)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-md",
                  config.color
                )}
              >
                <Icon className="size-3.5" />
              </div>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                {config.label}
              </Badge>
            </div>
            {isPreviewing && <Link2 className="size-3 text-primary" />}
            {isChatFocused && !isPreviewing && (
              <MessageSquare className="size-3 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <p className="text-sm font-medium leading-snug">{doc.title}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {doc.description}
          </p>
          {doc.pageCount && (
            <p className="mt-1.5 text-[10px] text-muted-foreground/70">
              {doc.pageCount} pages
            </p>
          )}
        </button>
        <Button
          type="button"
          variant={isChatFocused ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "size-8 shrink-0 transition-opacity",
            isChatFocused
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
          aria-label={`Chat with ${doc.title}`}
          onClick={() => onFocusChatDocument(doc.id)}
        >
          <MessageSquare className="size-3.5" />
        </Button>
        <SourceActionsMenu
          notebookId={notebookId}
          source={doc}
          onUpdated={onSourceUpdated}
          onDeleted={onSourceDeleted}
        />
      </div>
    </div>
  )
}
