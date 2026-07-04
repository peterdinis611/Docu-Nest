"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Headphones,
  MessageSquare,
  Upload,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/layout/PageHeader"
import { EMPTY_ANALYTICS } from "@/lib/analytics"
import { percentOf } from "@/lib/math"
import { cn } from "@/lib/utils"
import type { AnalyticsData, UsageMetric } from "@/types"

const progressColors = [
  "bg-violet-500",
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
]

function formatMetricChange(metric: UsageMetric) {
  const sign = metric.change >= 0 ? "+" : ""
  if (metric.unit === "h") {
    return `${sign}${metric.change}h vs last week`
  }
  return `${sign}${metric.change}% vs last week`
}

function metricProgress(metric: UsageMetric, maxValue: number) {
  return percentOf(metric.value, maxValue)
}

export function AnalyticsPage({
  data = EMPTY_ANALYTICS,
}: {
  data?: AnalyticsData
}) {
  const maxActivity = Math.max(
    ...data.weeklyActivity.map((d) => d.chats + d.uploads + d.studio),
    1
  )
  const maxMetricValue = Math.max(...data.metrics.map((m) => m.value), 1)
  const maxNotebookMessages = Math.max(
    ...data.topNotebooks.map((nb) => nb.messageCount),
    1
  )
  const weekTotals = data.weeklyActivity.reduce(
    (acc, day) => ({
      chats: acc.chats + day.chats,
      uploads: acc.uploads + day.uploads,
      studio: acc.studio + day.studio,
    }),
    { chats: 0, uploads: 0, studio: 0 }
  )

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Usage insights across all notebooks · Last 7 days"
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((metric, i) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between">
                  {metric.label}
                  {metric.change >= 0 ? (
                    <ArrowUpRight className="size-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="size-4 text-amber-500" />
                  )}
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {metric.value}
                  {metric.unit}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={metricProgress(metric, maxMetricValue)}
                  className="h-1.5"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatMetricChange(metric)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Weekly activity</CardTitle>
              <CardDescription>
                Chats, uploads, and studio outputs by day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end justify-between gap-2 pt-4">
                {data.weeklyActivity.map((day) => {
                  const total = day.chats + day.uploads + day.studio
                  return (
                    <div
                      key={day.day}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="flex w-full flex-col justify-end gap-0.5"
                        style={{ height: "160px" }}
                      >
                        <div
                          className="w-full rounded-t bg-violet-500/70 transition-all"
                          style={{
                            height: `${(day.studio / maxActivity) * 160}px`,
                          }}
                          title={`Studio: ${day.studio}`}
                        />
                        <div
                          className="w-full bg-emerald-500/70 transition-all"
                          style={{
                            height: `${(day.uploads / maxActivity) * 160}px`,
                          }}
                          title={`Uploads: ${day.uploads}`}
                        />
                        <div
                          className="w-full rounded-b bg-primary/70 transition-all"
                          style={{
                            height: `${(day.chats / maxActivity) * 160}px`,
                          }}
                          title={`Chats: ${day.chats}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {day.day}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {total}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-primary/70" /> Chats
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-emerald-500/70" />{" "}
                  Uploads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-violet-500/70" />{" "}
                  Studio
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top notebooks</CardTitle>
              <CardDescription>By message volume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.topNotebooks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notebook activity yet.
                </p>
              ) : (
                data.topNotebooks.map((nb, i) => (
                  <div key={nb.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{nb.title}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {nb.messageCount}
                      </span>
                    </div>
                    <Progress
                      value={(nb.messageCount / maxNotebookMessages) * 100}
                      className="h-1.5"
                      indicatorClassName={progressColors[i] ?? "bg-primary"}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="breakdown">
          <TabsList>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-primary" />
                    <CardTitle className="text-sm">Chat sessions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tabular-nums">
                    {data.breakdown.chatSessions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg {data.breakdown.avgChatsPerDay} per day
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Upload className="size-4 text-emerald-600" />
                    <CardTitle className="text-sm">Documents added</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tabular-nums">
                    {data.breakdown.documentsAdded}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across {data.breakdown.notebooksWithUploads} notebook
                    {data.breakdown.notebooksWithUploads === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Headphones className="size-4 text-violet-600" />
                    <CardTitle className="text-sm">Studio generated</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tabular-nums">
                    {data.breakdown.studioGenerated}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.breakdown.audioOverviews} audio overview
                    {data.breakdown.audioOverviews === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="size-4" />
                  7-day totals
                </CardTitle>
                <CardDescription>
                  Activity compared across the current week
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Chats
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {weekTotals.chats}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Uploads
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {weekTotals.uploads}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Studio
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {weekTotals.studio}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="size-4 text-amber-500" />
                  Time saved estimate
                </CardTitle>
                <CardDescription>
                  Based on avg. 4 min saved per grounded answer vs manual search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold tabular-nums">
                    {data.efficiency.hoursSaved}
                  </span>
                  <span className="mb-1 text-muted-foreground">
                    hours this week
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {data.efficiency.answerCount} answers
                  </Badge>
                  <Badge variant="secondary">~4 min each</Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      data.efficiency.hoursSavedChange >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {data.efficiency.hoursSavedChange >= 0 ? "+" : ""}
                    {data.efficiency.hoursSavedChange}h vs last week
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
