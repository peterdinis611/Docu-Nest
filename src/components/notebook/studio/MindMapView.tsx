"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Network, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MindMapNode } from "@/lib/studio/types"

const branchThemes = [
  {
    stroke: "#ec4899",
    node: "border-pink-500/40 bg-pink-500/12 text-pink-700 dark:text-pink-300",
    nodeActive: "border-pink-500 bg-pink-500/20 shadow-[0_0_0_3px_rgba(236,72,153,0.15)]",
    chip: "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  {
    stroke: "#8b5cf6",
    node: "border-violet-500/40 bg-violet-500/12 text-violet-700 dark:text-violet-300",
    nodeActive: "border-violet-500 bg-violet-500/20 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]",
    chip: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  {
    stroke: "#3b82f6",
    node: "border-blue-500/40 bg-blue-500/12 text-blue-700 dark:text-blue-300",
    nodeActive: "border-blue-500 bg-blue-500/20 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]",
    chip: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  {
    stroke: "#10b981",
    node: "border-emerald-500/40 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    nodeActive: "border-emerald-500 bg-emerald-500/20 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
    chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    stroke: "#f59e0b",
    node: "border-amber-500/40 bg-amber-500/12 text-amber-700 dark:text-amber-300",
    nodeActive: "border-amber-500 bg-amber-500/20 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]",
    chip: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    stroke: "#f97316",
    node: "border-orange-500/40 bg-orange-500/12 text-orange-700 dark:text-orange-300",
    nodeActive: "border-orange-500 bg-orange-500/20 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]",
    chip: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
] as const

interface LayoutNode {
  branch: MindMapNode
  x: number
  y: number
  themeIndex: number
}

interface MindMapViewProps {
  root: MindMapNode
  variant?: "compact" | "expanded"
}

function layoutBranches(
  branches: MindMapNode[],
  canvasWidth: number,
  rootY: number,
  branchRadius: number
): LayoutNode[] {
  if (branches.length === 0) return []

  const rootX = canvasWidth / 2
  const startAngle = Math.PI * 0.1
  const endAngle = Math.PI * 0.9

  return branches.map((branch, index) => {
    const t = branches.length === 1 ? 0.5 : index / (branches.length - 1)
    const angle = startAngle + (endAngle - startAngle) * t

    return {
      branch,
      x: rootX + branchRadius * Math.cos(angle),
      y: rootY + branchRadius * Math.sin(angle),
      themeIndex: index % branchThemes.length,
    }
  })
}

function connectorPath(x1: number, y1: number, x2: number, y2: number) {
  const midY = (y1 + y2) / 2
  return `M ${x1} ${y1} Q ${x1} ${midY}, ${(x1 + x2) / 2} ${midY} T ${x2} ${y2}`
}

function BranchDetailPanel({
  branch,
  theme,
  onClose,
  expanded,
}: {
  branch: MindMapNode
  theme: (typeof branchThemes)[number]
  onClose: () => void
  expanded?: boolean
}) {
  const children = branch.children ?? []

  return (
    <motion.div
      key={branch.id}
      initial={{ opacity: 0, y: expanded ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: expanded ? 0 : -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        expanded && "h-full"
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Branch
          </p>
          <p className="mt-0.5 text-sm font-medium leading-snug">{branch.label}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close branch"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className={cn("space-y-2 p-4", expanded && "max-h-[calc(100%-4rem)] overflow-y-auto")}>
        {children.length > 0 ? (
          children.map((child) => (
            <div key={child.id} className="flex items-start gap-2.5">
              <span className={cn("mt-2 size-2 shrink-0 rounded-full", theme.dot)} />
              <div
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
                  theme.chip
                )}
              >
                {child.label}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No sub-concepts extracted from this source yet.
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function MindMapView({ root, variant = "compact" }: MindMapViewProps) {
  const expanded = variant === "expanded"
  const canvasWidth = expanded ? 560 : 300
  const rootY = expanded ? 72 : 52
  const branchRadius = expanded ? 168 : 108
  const rootX = canvasWidth / 2
  const nodeMaxWidth = expanded ? 140 : 108
  const rootMaxWidth = expanded ? 180 : 148

  const branches = root.children ?? []
  const layout = useMemo(
    () => layoutBranches(branches, canvasWidth, rootY, branchRadius),
    [branches, branchRadius, canvasWidth, rootY]
  )
  const conceptCount = useMemo(
    () => branches.reduce((sum, branch) => sum + (branch.children?.length ?? 0), 0),
    [branches]
  )

  const [activeId, setActiveId] = useState<string | null>(
    branches.length === 1 ? branches[0]?.id ?? null : null
  )

  const activeBranch = branches.find((branch) => branch.id === activeId)
  const activeLayout = layout.find((item) => item.branch.id === activeId)
  const activeTheme = activeLayout
    ? branchThemes[activeLayout.themeIndex]
    : branchThemes[0]

  const canvasHeight = expanded
    ? branches.length > 5
      ? 340
      : 300
    : branches.length > 4
      ? 220
      : 200

  const canvas = (
    <div
      className={cn(
        "relative mx-auto",
        expanded ? "w-full max-w-3xl" : ""
      )}
      style={{ width: expanded ? "100%" : canvasWidth, height: canvasHeight }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {layout.map(({ branch, x, y, themeIndex }) => {
          const theme = branchThemes[themeIndex]
          const isActive = activeId === branch.id

          return (
            <path
              key={branch.id}
              d={connectorPath(rootX, rootY + 22, x, y - 18)}
              fill="none"
              stroke={theme.stroke}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeOpacity={isActive ? 0.75 : 0.28}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      <motion.button
        type="button"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "absolute z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-2xl border border-pink-500/35 bg-gradient-to-br from-pink-500/15 via-card to-violet-500/10 px-4 py-3 text-center shadow-sm",
          activeId === null && "ring-2 ring-pink-500/20",
          expanded && "px-5 py-3.5"
        )}
        style={{
          left: `${(rootX / canvasWidth) * 100}%`,
          top: rootY - 24,
          maxWidth: rootMaxWidth,
        }}
        onClick={() => setActiveId(null)}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400",
            expanded ? "size-10" : "size-8"
          )}
        >
          <Network className={expanded ? "size-5" : "size-4"} />
        </div>
        <span
          className={cn(
            "line-clamp-2 font-semibold leading-tight",
            expanded ? "text-sm" : "text-[11px]"
          )}
        >
          {root.label}
        </span>
      </motion.button>

      {layout.map(({ branch, x, y, themeIndex }, index) => {
        const theme = branchThemes[themeIndex]
        const isActive = activeId === branch.id
        const childCount = branch.children?.length ?? 0

        return (
          <motion.button
            key={branch.id}
            type="button"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "absolute z-10 -translate-x-1/2 rounded-xl border px-3 py-2.5 text-center transition-all duration-200",
              theme.node,
              isActive && theme.nodeActive,
              expanded ? "text-xs" : "text-[10px]"
            )}
            style={{
              left: `${(x / canvasWidth) * 100}%`,
              top: y - 18,
              maxWidth: nodeMaxWidth,
            }}
            onClick={() => setActiveId(isActive ? null : branch.id)}
            title={branch.label}
          >
            <span className={cn("mx-auto mb-1 block size-1.5 rounded-full", theme.dot)} />
            <span className="line-clamp-2 font-medium leading-snug">{branch.label}</span>
            {childCount > 0 && (
              <span className="mt-1 block opacity-70">
                {childCount} {childCount === 1 ? "idea" : "ideas"}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )

  if (expanded) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="h-6 px-2.5 text-xs font-normal">
            {branches.length} sources
          </Badge>
          {conceptCount > 0 && (
            <Badge variant="outline" className="h-6 px-2.5 text-xs font-normal">
              {conceptCount} concepts
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Select a node to explore connected ideas
          </span>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-background p-4 lg:p-6">
            {branches.length === 0 ? (
              <div className="flex h-full min-h-48 items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No branches yet. Enable sources to build your map.
                </p>
              </div>
            ) : (
              canvas
            )}
          </div>

          <div className="min-h-[220px] lg:min-h-0">
            <AnimatePresence mode="wait">
              {activeBranch ? (
                <BranchDetailPanel
                  branch={activeBranch}
                  theme={activeTheme}
                  onClose={() => setActiveId(null)}
                  expanded
                />
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center"
                >
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Pick a source node on the map to see its concepts here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-background">
        {branches.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No branches yet. Enable sources to build your map.
            </p>
          </div>
        ) : (
          canvas
        )}

        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-border/50 px-3 py-2">
          <Badge variant="secondary" className="h-5 px-2 text-[10px] font-normal">
            {branches.length} sources
          </Badge>
          {conceptCount > 0 && (
            <Badge variant="outline" className="h-5 px-2 text-[10px] font-normal">
              {conceptCount} concepts
            </Badge>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeBranch ? (
          <BranchDetailPanel
            branch={activeBranch}
            theme={activeTheme}
            onClose={() => setActiveId(null)}
          />
        ) : branches.length > 0 ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-dashed px-4 py-5 text-center"
          >
            <p className="text-xs text-muted-foreground">
              Select a source node on the map to see its connected ideas.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
