"use client"

import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
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
import { mockUsageMetrics } from "@/data/mock"
import { getNotebookDotClass } from "@/lib/notebook-colors"
import { cn } from "@/lib/utils"
import type { ActivityItem, Notebook } from "@/types"

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

function getGreeting(name?: string | null) {
  const hour = new Date().getHours()
  const time =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  return name ? `${time}, ${name}` : time
}

export function HomePage({
  notebooks,
  activity,
}: {
  notebooks: Notebook[]
  activity: ActivityItem[]
}) {
  const { user } = useUser()
  const totalSources = notebooks.reduce((s, n) => s + n.sourceCount, 0)
  const totalMessages = notebooks.reduce((s, n) => s + n.messageCount, 0)
  const featured = notebooks[0]
  const firstName = user?.firstName ?? null

  return (
    <>
      <PageHeader
        title={getGreeting(firstName)}
        description={`${notebooks.length} notebooks · ${totalSources} sources · ${totalMessages} messages`}
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
        {featured ? (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Continue where you left off
                </p>
                <h2 className="text-lg font-semibold tracking-tight">
                  {featured.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {featured.sourceCount} sources · Last active{" "}
                  {formatRelativeTime(featured.updatedAt)}
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 gap-2">
                <Link href={`/notebook/${featured.id}`}>
                  <BookOpen className="size-4" />
                  Open notebook
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold tracking-tight">
                Welcome to DocuNest
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create a notebook to upload documents, chat with AI, and generate
                study materials. Use <strong>New notebook</strong> above to get
                started.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockUsageMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {metric.value}
                  {metric.unit}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  +{metric.change}% vs last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Your notebooks</h2>
              <Link
                href="/app/library"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                View all
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {notebooks.length === 0 ? (
                <Card className="col-span-full border-dashed">
                  <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <BookOpen className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No notebooks yet. Create one to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notebooks.map((notebook) => (
                  <Link key={notebook.id} href={`/notebook/${notebook.id}`}>
                    <Card className="h-full transition-colors hover:bg-accent/40">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-1.5 size-2 shrink-0 rounded-full",
                              getNotebookDotClass(notebook.color)
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium leading-snug">
                              {notebook.title}
                            </CardTitle>
                            {notebook.description && (
                              <CardDescription className="mt-1 line-clamp-2 text-xs">
                                {notebook.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pb-4">
                        {notebook.tags && notebook.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {notebook.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {notebook.sourceCount} sources · {notebook.messageCount}{" "}
                          messages
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-sm font-medium">Recent activity</h2>

            <Card>
              {activity.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No recent activity yet. Upload a source, chat, or generate
                  studio content to see updates here.
                </div>
              ) : (
                <ul className="divide-y">
                  {activity.map((item) => {
                    const Icon = activityIcons[item.type]
                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                          <Icon className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm leading-snug">
                            {item.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
