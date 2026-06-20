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
import { mockActivity, mockNotebooks, mockUsageMetrics } from "@/data/mock"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/types"

const activityIcons: Record<ActivityItem["type"], typeof MessageSquare> = {
  chat: MessageSquare,
  upload: Upload,
  studio: Sparkles,
  note: FileText,
}

const activityColors: Record<ActivityItem["type"], string> = {
  chat:   "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  upload: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  studio: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  note:   "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const metricIcons = [TrendingUp, MessageSquare, Sparkles, Zap]
const metricColors = [
  "from-violet-500/15 to-violet-500/5 ring-violet-200 dark:ring-violet-800/60",
  "from-sky-500/15 to-sky-500/5 ring-sky-200 dark:ring-sky-800/60",
  "from-amber-500/15 to-amber-500/5 ring-amber-200 dark:ring-amber-800/60",
  "from-emerald-500/15 to-emerald-500/5 ring-emerald-200 dark:ring-emerald-800/60",
]
const metricValueColors = [
  "text-violet-600 dark:text-violet-400",
  "text-sky-600 dark:text-sky-400",
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
]

export function HomePage() {
  const totalSources = mockNotebooks.reduce((s, n) => s + n.sourceCount, 0)

  return (
    <>
      <PageHeader
        title="Good morning, Peter 👋"
        description={`${mockNotebooks.length} notebooks · ${totalSources} sources indexed`}
        actions={
          <CreateNotebookDialog
            trigger={
              <Button className="gap-2">
                <Plus className="size-4" />
                New notebook
              </Button>
            }
          />
        }
      />

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-7 text-primary-foreground shadow-xl shadow-primary/20 dark:shadow-primary/10 lg:p-8">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-20 size-40 rounded-full bg-black/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 opacity-80" />
                <span className="text-[11px] font-semibold uppercase tracking-widest opacity-75">
                  Continue where you left off
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Transformer & RAG Research
              </h2>
              <p className="max-w-sm text-sm opacity-75">
                4 sources loaded · Last active 2 hours ago
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="gap-2 bg-white/15 text-primary-foreground hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20"
            >
              <Link to="/notebook/nb-1">
                <BookOpen className="size-4" />
                Open notebook
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockUsageMetrics.map((metric, i) => {
            const Icon = metricIcons[i]
            return (
              <Card
                key={metric.label}
                className={cn(
                  "relative overflow-hidden border-0 bg-gradient-to-br ring-1",
                  metricColors[i]
                )}
              >
                <CardHeader className="pb-1 pt-5">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide text-current opacity-65">
                      {metric.label}
                    </CardDescription>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20">
                      <Icon className={cn("size-3.5", metricValueColors[i])} />
                    </div>
                  </div>
                  <CardTitle className={cn("mt-1 text-3xl font-bold tabular-nums", metricValueColors[i])}>
                    {metric.value}
                    {metric.unit && (
                      <span className="text-xl font-medium opacity-60">{metric.unit}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <p className="text-xs font-medium opacity-70">
                    +{metric.change}% this week
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ── Notebooks + Activity ── */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Notebooks */}
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Your notebooks</h2>
              <Link
                to="/app/library"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {mockNotebooks.map((notebook) => (
                <Link key={notebook.id} to={`/notebook/${notebook.id}`}>
                  <Card className="group h-full overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
                    {/* colour strip */}
                    <div
                      className={cn(
                        "h-1.5 w-full bg-gradient-to-r",
                        notebook.color.replace("/20", "/70").replace("/10", "/50")
                      )}
                    />
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary">
                          {notebook.title}
                        </CardTitle>
                        <BookOpen className="size-3.5 shrink-0 text-muted-foreground/0 transition-all group-hover:text-primary/60 group-hover:opacity-100" />
                      </div>
                      <CardDescription className="line-clamp-2 text-[13px]">
                        {notebook.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <div className="flex flex-wrap gap-1">
                        {notebook.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-2 py-0 text-[10px] font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{notebook.sourceCount} sources</span>
                        <span>{notebook.messageCount} messages</span>
                      </div>
                      <Progress
                        value={(notebook.messageCount / 70) * 100}
                        className="h-1 bg-muted/60"
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-base font-semibold">Recent activity</h2>

            <Card className="border border-border/50 shadow-sm">
              <ul className="divide-y divide-border/50">
                {mockActivity.map((item) => {
                  const Icon = activityIcons[item.type]
                  const color = activityColors[item.type]
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40"
                    >
                      <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", color)}>
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium leading-snug">{item.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {item.notebookTitle}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 pt-0.5 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>

            {/* Quick-start card */}
            <Card className="border border-border/50 bg-gradient-to-br from-primary/6 to-transparent shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[15px]">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/12">
                    <Sparkles className="size-3.5 text-primary" />
                  </div>
                  Quick start
                </CardTitle>
                <CardDescription className="text-[13px]">
                  Jump back into your most active notebook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full gap-2" size="sm">
                  <Link to="/notebook/nb-1">
                    <BookOpen className="size-4" />
                    Continue researching
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
