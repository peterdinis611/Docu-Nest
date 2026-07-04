"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  BookOpen,
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
  Download,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  Globe,
  Grid3X3,
  List,
  Loader2,
  NotebookPen,
  ScrollText,
  Search,
  SortAsc,
  Upload,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { CreateNotebookDialog } from "@/components/dialogs/CreateNotebookDialog"
import { SourceActionsMenu } from "@/components/notebook/SourceActionsMenu"
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
import { downloadRemoteFile } from "@/lib/download-file"
import { fileName } from "@/lib/file-preview"
import { getNotebookDotClass } from "@/lib/notebook-colors"
import { libraryDocumentFuseOptions } from "@/lib/search-index"
import { cn } from "@/lib/utils"
import type { DocumentType, LibraryDocument, SourceDocument } from "@/types"

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
  { value: "title-asc", label: "Title A → Z", icon: ArrowDownAZ },
  { value: "title-desc", label: "Title Z → A", icon: ArrowUpAZ },
  { value: "date-desc", label: "Newest first", icon: CalendarArrowDown },
  { value: "date-asc", label: "Oldest first", icon: CalendarArrowUp },
  { value: "pages-desc", label: "Most pages", icon: SortAsc },
]

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "disabled", label: "Disabled only" },
]

function formatFileSize(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sortDocs(docs: LibraryDocument[], sort: SortKey) {
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

function buildLibraryStats(documents: LibraryDocument[]) {
  const notebookIds = new Set(documents.map((doc) => doc.notebookId))

  return {
    total: documents.length,
    active: documents.filter((doc) => doc.enabled).length,
    notebooks: notebookIds.size,
    withFiles: documents.filter((doc) => doc.fileUrl).length,
  }
}

interface LibraryPageProps {
  documents: LibraryDocument[]
}

export function LibraryPage({ documents: initialDocuments }: LibraryPageProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [notebookFilter, setNotebookFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("date-desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    setDocuments(initialDocuments)
  }, [initialDocuments])

  function handleSourceUpdated(source: SourceDocument) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === source.id
          ? {
              ...doc,
              ...source,
              notebookId: doc.notebookId,
              notebookTitle: doc.notebookTitle,
              notebookColor: doc.notebookColor,
            }
          : doc
      )
    )
    router.refresh()
  }

  function handleSourceDeleted(sourceId: string) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== sourceId))
    router.refresh()
  }

  const stats = useMemo(() => buildLibraryStats(documents), [documents])

  const notebooks = useMemo(() => {
    const map = new Map<string, { id: string; title: string; color: string }>()

    for (const doc of documents) {
      map.set(doc.notebookId, {
        id: doc.notebookId,
        title: doc.notebookTitle,
        color: doc.notebookColor,
      })
    }

    return [...map.values()].sort((a, b) => a.title.localeCompare(b.title))
  }, [documents])

  const fuse = useMemo(
    () => createFuseIndex(documents, libraryDocumentFuseOptions),
    [documents]
  )

  const filtered = useMemo(() => {
    let docs = searchFuse(fuse, search, documents)

    if (typeFilter !== "all") {
      docs = docs.filter((doc) => doc.type === typeFilter)
    }

    if (statusFilter === "active") {
      docs = docs.filter((doc) => doc.enabled)
    } else if (statusFilter === "disabled") {
      docs = docs.filter((doc) => !doc.enabled)
    }

    if (notebookFilter !== "all") {
      docs = docs.filter((doc) => doc.notebookId === notebookFilter)
    }

    return sortDocs(docs, sort)
  }, [documents, fuse, notebookFilter, search, sort, statusFilter, typeFilter])

  const activeSort = sortOptions.find((option) => option.value === sort)!
  const hasActiveFilters =
    statusFilter !== "all" || notebookFilter !== "all" || typeFilter !== "all"

  async function handleDownload(doc: LibraryDocument) {
    if (!doc.fileUrl) return

    setDownloadingId(doc.id)

    try {
      await downloadRemoteFile(doc.fileUrl, fileName(doc))
      toast.success("Download started", { description: fileName(doc) })
    } catch {
      toast.error("Download failed")
    } finally {
      setDownloadingId(null)
    }
  }

  function clearFilters() {
    setStatusFilter("all")
    setNotebookFilter("all")
    setTypeFilter("all")
  }

  return (
    <>
      <PageHeader
        title="Library"
        description={
          documents.length > 0
            ? `All sources across ${stats.notebooks} notebook${stats.notebooks !== 1 ? "s" : ""} · ${stats.total} documents`
            : "Browse every document uploaded across your notebooks"
        }
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8">
        {documents.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total documents</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active in chat</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{stats.active}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Notebooks</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{stats.notebooks}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Uploaded files</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{stats.withFiles}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as DocumentType | "all")}
            >
              <TabsList>
                {typeFilters.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value} className="text-xs">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

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
                      {(statusFilter !== "all" ? 1 : 0) +
                        (notebookFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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

                {notebooks.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Notebook
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => setNotebookFilter("all")}
                        className="gap-2"
                      >
                        All notebooks
                        {notebookFilter === "all" && (
                          <Check className="ml-auto size-3.5 text-primary" />
                        )}
                      </DropdownMenuItem>
                      {notebooks.map((notebook) => (
                        <DropdownMenuItem
                          key={notebook.id}
                          onClick={() => setNotebookFilter(notebook.id)}
                          className="gap-2"
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              getNotebookDotClass(notebook.color)
                            )}
                          />
                          <span className="truncate">{notebook.title}</span>
                          {notebookFilter === notebook.id && (
                            <Check className="ml-auto size-3.5 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </>
                )}

                {hasActiveFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={clearFilters}
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

        <p className="text-xs text-muted-foreground">
          {filtered.length} of {documents.length} documents
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] hover:bg-accent"
            >
              <X className="size-2.5" /> Clear filters
            </button>
          )}
        </p>

        {documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <FolderOpen className="mb-4 size-10 text-muted-foreground/50" />
              <p className="font-medium">Your library is empty</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Upload sources to a notebook to see them here. The library shows
                every document across all your notebooks in one place.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <CreateNotebookDialog
                  trigger={
                    <Button className="gap-2">
                      <BookOpen className="size-4" />
                      Create notebook
                    </Button>
                  }
                />
                <Button variant="outline" asChild className="gap-2">
                  <Link href="/app">
                    <Upload className="size-4" />
                    Go to home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
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
              const sizeLabel = formatFileSize(doc.fileSize)

              return (
                <Card
                  key={doc.id}
                  className="group flex flex-col transition-all hover:border-primary/30 hover:shadow-sm"
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
                  <CardContent className="mt-auto space-y-3">
                    <Link
                      href={`/notebook/${doc.notebookId}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          getNotebookDotClass(doc.notebookColor)
                        )}
                      />
                      {doc.notebookTitle}
                    </Link>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {doc.pageCount ? `${doc.pageCount} pages · ` : ""}
                        {sizeLabel ? `${sizeLabel} · ` : ""}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5",
                          doc.enabled
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {doc.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 text-xs"
                      >
                        <Link href={`/notebook/${doc.notebookId}`}>
                          <ExternalLink className="size-3.5" />
                          Open
                        </Link>
                      </Button>
                      {doc.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 flex-1 text-xs"
                          disabled={downloadingId === doc.id}
                          onClick={() => handleDownload(doc)}
                        >
                          {downloadingId === doc.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                          Download
                        </Button>
                      )}
                      <SourceActionsMenu
                        notebookId={doc.notebookId}
                        source={doc}
                        onUpdated={handleSourceUpdated}
                        onDeleted={handleSourceDeleted}
                      />
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
                const sizeLabel = formatFileSize(doc.fileSize)

                return (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <Link
                      href={`/notebook/${doc.notebookId}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate text-sm font-medium">{doc.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "mr-1.5 inline-block size-1.5 rounded-full align-middle",
                            getNotebookDotClass(doc.notebookColor)
                          )}
                        />
                        {doc.notebookTitle} · {doc.type}
                        {sizeLabel ? ` · ${sizeLabel}` : ""}
                      </p>
                    </Link>
                    <span className="hidden text-xs text-muted-foreground md:inline">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-[11px] sm:inline",
                        doc.enabled
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {doc.enabled ? "Active" : "Disabled"}
                    </span>
                    <Badge variant="secondary" className="hidden capitalize text-[10px] sm:inline-flex">
                      {doc.type}
                    </Badge>
                    {doc.fileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        disabled={downloadingId === doc.id}
                        aria-label={`Download ${doc.title}`}
                        onClick={() => handleDownload(doc)}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                    )}
                    <SourceActionsMenu
                      notebookId={doc.notebookId}
                      source={doc}
                      onUpdated={handleSourceUpdated}
                      onDeleted={handleSourceDeleted}
                    />
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
