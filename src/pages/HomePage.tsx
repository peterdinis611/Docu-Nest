import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { CreateNotebookDialog } from "@/components/dialogs/CreateNotebookDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  mockActivity,
  mockNotebooks,
  mockUsageMetrics,
} from "@/data/mock"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/types"

const activityIcons: Record<ActivityItem["type"], typeof MessageSquare> = {
  chat: MessageSquare,
  upload: Upload,
  studio: Sparkles,
  note: FileText,
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function HomePage() {
  const totalSources = mockNotebooks.reduce((s, n) => s + n.sourceCount, 0)

  return (
    <>
      <PageHeader
        title="Good morning, Peter"
        description={`${mockNotebooks.length} notebooks · ${totalSources} sources indexed`}
        actions={
          <CreateNotebookDialog
            trigger={
              <Button className="gap-2 shadow-sm">
                <Plus className="size-4" />
                New notebook
              </Button>
            }
          />
        }
      />

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm lg:p-8">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  Continue where you left off
                </span>
              </div>
              <h2 className="text-xl font-semibold">Transformer & RAG Research</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                4 sources loaded · Last active 2 hours ago
              </p>
            </div>
            <Button asChild size="lg" className="gap-2 shadow-md">
              <Link to="/notebook/nb-1">
                <Sparkles className="size-4" />
                Open notebook
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockUsageMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="relative overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60"
            >
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide">
                  {metric.label}
                </CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {metric.value}
                  {metric.unit && (
                    <span className="text-lg font-normal text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3" />+{metric.change}% this week
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your notebooks</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View all <ArrowRight className="size-3" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {mockNotebooks.map((notebook) => (
                <Link key={notebook.id} to={`/notebook/${notebook.id}`}>
                  <Card className="group h-full overflow-hidden border-0 shadow-sm ring-1 ring-border/60 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20">
                    <div
                      className={cn(
                        "h-2 bg-gradient-to-r",
                        notebook.color.replace("/20", "/60").replace("/10", "/40")
                      )}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug transition-colors group-hover:text-primary">
                          {notebook.title}
                        </CardTitle>
                        <BookOpen className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {notebook.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {notebook.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{notebook.sourceCount} sources</span>
                        <span>{notebook.messageCount} messages</span>
                      </div>
                      <Progress
                        value={(notebook.messageCount / 70) * 100}
                        className="h-1"
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Card className="border-0 shadow-sm ring-1 ring-border/60">
              <CardContent className="p-0">
                <ul className="divide-y divide-border/60">
                  {mockActivity.map((item) => {
                    const Icon = activityIcons[item.type]
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="size-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{item.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.notebookTitle}
                          </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
