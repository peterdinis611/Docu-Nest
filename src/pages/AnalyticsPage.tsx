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
import {
  mockNotebooks,
  mockUsageMetrics,
  mockWeeklyActivity,
} from "@/data/mock"
import { cn } from "@/lib/utils"

const maxActivity = Math.max(
  ...mockWeeklyActivity.map((d) => d.chats + d.uploads + d.studio)
)

export function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Usage insights across all notebooks · Last 7 days"
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockUsageMetrics.map((metric, i) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                {metric.label}
                {i % 2 === 0 ? (
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
              <Progress value={60 + i * 8} className="h-1.5" />
              <p className="mt-2 text-xs text-muted-foreground">
                +{metric.change}% vs last week
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
              {mockWeeklyActivity.map((day) => {
                const total = day.chats + day.uploads + day.studio
                return (
                  <div
                    key={day.day}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex w-full flex-col justify-end gap-0.5" style={{ height: "160px" }}>
                      <div
                        className="w-full rounded-t bg-violet-500/70 transition-all"
                        style={{ height: `${(day.studio / maxActivity) * 160}px` }}
                        title={`Studio: ${day.studio}`}
                      />
                      <div
                        className="w-full bg-emerald-500/70 transition-all"
                        style={{ height: `${(day.uploads / maxActivity) * 160}px` }}
                        title={`Uploads: ${day.uploads}`}
                      />
                      <div
                        className="w-full rounded-b bg-primary/70 transition-all"
                        style={{ height: `${(day.chats / maxActivity) * 160}px` }}
                        title={`Chats: ${day.chats}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
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
                <span className="size-2.5 rounded-sm bg-emerald-500/70" /> Uploads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-violet-500/70" /> Studio
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
            {[...mockNotebooks]
              .sort((a, b) => b.messageCount - a.messageCount)
              .slice(0, 4)
              .map((nb, i) => (
                <div key={nb.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{nb.title}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {nb.messageCount}
                    </span>
                  </div>
                  <Progress
                    value={(nb.messageCount / 70) * 100}
                    className="h-1.5"
                    indicatorClassName={cn(
                      i === 0 && "bg-violet-500",
                      i === 1 && "bg-primary",
                      i === 2 && "bg-emerald-500",
                      i === 3 && "bg-amber-500"
                    )}
                  />
                </div>
              ))}
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
                <p className="text-3xl font-semibold tabular-nums">85</p>
                <p className="text-xs text-muted-foreground">Avg 12.1 per day</p>
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
                <p className="text-3xl font-semibold tabular-nums">9</p>
                <p className="text-xs text-muted-foreground">Across 3 notebooks</p>
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
                <p className="text-3xl font-semibold tabular-nums">18</p>
                <p className="text-xs text-muted-foreground">6 audio overviews</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              <BarChart3 className="mr-2 size-5" />
              Trend charts will connect to live usage data
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
                <span className="text-4xl font-semibold tabular-nums">9.5</span>
                <span className="mb-1 text-muted-foreground">hours this week</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">143 answers</Badge>
                <Badge variant="secondary">~4 min each</Badge>
                <Badge variant="secondary">+2.1h vs last week</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  )
}
