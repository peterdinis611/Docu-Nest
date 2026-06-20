import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
  FileText,
  Filter,
  Globe,
  Grid3X3,
  List,
  NotebookPen,
  ScrollText,
  Search,
  SortAsc,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createFuseIndex, searchFuse } from "@/hooks/useFuseSearch"
import { libraryDocumentFuseOptions } from "@/lib/search-index"
import { mockAllDocuments } from "@/data/mock"
import { cn } from "@/lib/utils"
import type { DocumentType } from "@/types"

const typeIcons: Record<DocumentType, typeof FileText> = {
  pdf: ScrollText,
  article: FileText,
  note: NotebookPen,
  webpage: Globe,
}

const typeFilters: { value: DocumentType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pdf", label: "PDF" },
  { value: "article", label: "Articles" },
  { value: "note", label: "Notes" },
  { value: "webpage", label: "Web" },
]

type SortKey = "title-asc" | "title-desc" | "date-desc" | "date-asc" | "pages-desc"
type StatusFilter = "all" | "active" | "disabled"

const sortOptions: { value: SortKey; label: string; icon: typeof SortAsc }[] = [
  { value: "title-asc",   label: "Title A → Z",   icon: ArrowDownAZ },
  { value: "title-desc",  label: "Title Z → A",   icon: ArrowUpAZ },
  { value: "date-desc",   label: "Newest first",   icon: CalendarArrowDown },
  { value: "date-asc",    label: "Oldest first",   icon: CalendarArrowUp },
  { value: "pages-desc",  label: "Most pages",     icon: SortAsc },
]

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "All statuses" },
  { value: "active",   label: "Active only" },
  { value: "disabled", label: "Disabled only" },
]

function sortDocs(
  docs: typeof mockAllDocuments,
  sort: SortKey,
): typeof mockAllDocuments {
  return [...docs].sort((a, b) => {
    switch (sort) {
      case "title-asc":
        return a.title.localeCompare(b.title)
      case "title-desc":
        return b.title.localeCompare(a.title)
      case "date-desc":
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      case "date-asc":
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      case "pages-desc":
        return (b.pageCount ?? 0) - (a.pageCount ?? 0)
    }
  })
}

export function LibraryPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("date-desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const fuse = useMemo(
    () => createFuseIndex(mockAllDocuments, libraryDocumentFuseOptions),
    []
  )

  const filtered = useMemo(() => {
    let docs = searchFuse(fuse, search, mockAllDocuments)

    if (typeFilter !== "all") {
      docs = docs.filter((d) => d.type === typeFilter)
    }

    if (statusFilter === "active") {
      docs = docs.filter((d) => d.enabled)
    } else if (statusFilter === "disabled") {
      docs = docs.filter((d) => !d.enabled)
    }

    return sortDocs(docs, sort)
  }, [fuse, search, typeFilter, statusFilter, sort])

  const activeSort = sortOptions.find((o) => o.value === sort)!
  const hasActiveFilters = statusFilter !== "all"

  return (
    <>
      <PageHeader
        title="Library"
        description={`All sources across ${new Set(mockAllDocuments.map((d) => d.notebookId)).size} notebooks · ${mockAllDocuments.length} documents`}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8">
        {/* ── toolbar ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* type tabs */}
            <Tabs
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as DocumentType | "all")}
            >
              <TabsList>
                {typeFilters.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className="text-xs">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* view toggle */}
            <div className="flex rounded-lg border p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3X3 className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="size-4" />
              </Button>
            </div>

            {/* sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <activeSort.icon className="size-3.5" />
                  {activeSort.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sort by
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {sortOptions.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setSort(value)}
                      className="gap-2"
                    >
                      <Icon className="size-3.5 text-muted-foreground" />
                      {label}
                      {sort === value && (
                        <Check className="ml-auto size-3.5 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={hasActiveFilters ? "secondary" : "outline"}
                  size="sm"
                  className="gap-1.5"
                >
                  <Filter className="size-3.5" />
                  Filter
                  {hasActiveFilters && (
                    <Badge className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {statusOptions.map(({ value, label }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setStatusFilter(value)}
                      className="gap-2"
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          value === "active"
                            ? "bg-emerald-500"
                            : value === "disabled"
                              ? "bg-muted-foreground"
                              : "bg-border"
                        )}
                      />
                      {label}
                      {statusFilter === value && (
                        <Check className="ml-auto size-3.5 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                {hasActiveFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("all")}
                      className="gap-2 text-muted-foreground"
                    >
                      <X className="size-3.5" />
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── results summary ── */}
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {mockAllDocuments.length} documents
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] hover:bg-accent"
            >
              <X className="size-2.5" /> Clear filters
            </button>
          )}
        </p>

        {/* ── document list ── */}
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Search className="mb-4 size-10 text-muted-foreground/50" />
              <p className="font-medium">No documents found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc) => {
              const Icon = typeIcons[doc.type]
              return (
                <Card
                  key={doc.id}
                  className="group transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5 text-muted-foreground" />
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {doc.type}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-base leading-snug">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      to={`/notebook/${doc.notebookId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {doc.notebookTitle}
                    </Link>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {doc.pageCount ? `${doc.pageCount} pages · ` : ""}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5",
                          doc.enabled
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {doc.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              {filtered.map((doc) => {
                const Icon = typeIcons[doc.type]
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.notebookTitle} · {doc.type}
                      </p>
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-[11px] sm:inline",
                        doc.enabled
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {doc.enabled ? "Active" : "Disabled"}
                    </span>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {doc.type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
