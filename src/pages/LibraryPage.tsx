import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  FileText,
  Filter,
  Globe,
  Grid3X3,
  List,
  NotebookPen,
  ScrollText,
  Search,
  SortAsc,
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
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export function LibraryPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    return mockAllDocuments.filter((doc) => {
      const matchesSearch =
        !search ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.description.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [search, typeFilter])

  return (
    <>
      <PageHeader
        title="Library"
        description={`All sources across ${new Set(mockAllDocuments.map((d) => d.notebookId)).size} notebooks · ${mockAllDocuments.length} documents`}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8">
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

        <div className="flex items-center gap-2">
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

          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5">
            <SortAsc className="size-3.5" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="size-3.5" />
            Filter
          </Button>
        </div>
      </div>

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
