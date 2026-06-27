"use client"

import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { LucideIcon } from "lucide-react"
import type { SearchItem, SearchItemKind } from "@/lib/search-index"
import { cn } from "@/lib/utils"

const kindLabels: Record<SearchItemKind, string> = {
  page: "Pages",
  notebook: "Notebooks",
  document: "Documents",
}

type VirtualRow =
  | { type: "header"; id: string; kind: SearchItemKind }
  | { type: "item"; id: string; item: SearchItem; resultIndex: number }

function buildVirtualRows(
  results: SearchItem[],
  kindOrder: SearchItemKind[]
): VirtualRow[] {
  const grouped: Partial<Record<SearchItemKind, SearchItem[]>> = {}
  for (const item of results) {
    grouped[item.kind] ??= []
    grouped[item.kind]!.push(item)
  }

  const rows: VirtualRow[] = []
  let resultIndex = 0

  for (const kind of kindOrder) {
    const items = grouped[kind]
    if (!items?.length) continue

    rows.push({ type: "header", id: `header-${kind}`, kind })
    for (const item of items) {
      rows.push({
        type: "item",
        id: item.id,
        item,
        resultIndex,
      })
      resultIndex += 1
    }
  }

  return rows
}

interface SearchResultListProps {
  results: SearchItem[]
  kindOrder: SearchItemKind[]
  activeIndex: number
  getItemIcon: (item: SearchItem) => LucideIcon
  onSelect: (item: SearchItem) => void
  onActiveIndexChange: (index: number) => void
}

export function SearchResultList({
  results,
  kindOrder,
  activeIndex,
  getItemIcon,
  onSelect,
  onActiveIndexChange,
}: SearchResultListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(
    () => buildVirtualRows(results, kindOrder),
    [results, kindOrder]
  )

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.type === "header" ? 28 : 52),
    overscan: 10,
  })

  useLayoutEffect(() => {
    virtualizer.measure()
  }, [rows, virtualizer])

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
    const rowIndex = rows.findIndex(
      (row) => row.type === "item" && row.resultIndex === activeIndex
    )
    if (rowIndex >= 0) {
      virtualizer.scrollToIndex(rowIndex, { align: "auto" })
    }
  }, [activeIndex, rows, virtualizer])

  if (rows.length === 0) return null

  return (
    <div ref={parentRef} className="max-h-80 overflow-y-auto p-2">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null

          if (row.type === "header") {
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                className="absolute left-0 top-0 w-full px-2 py-1.5"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {kindLabels[row.kind]}
                </p>
              </div>
            )
          }

          const isActive = row.resultIndex === activeIndex
          const Icon = getItemIcon(row.item)

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              className="absolute left-0 top-0 w-full px-0.5"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(row.item)}
                onMouseEnter={() => onActiveIndexChange(row.resultIndex)}
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
                  <p className="truncate text-sm font-medium">{row.item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.item.subtitle}
                  </p>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
