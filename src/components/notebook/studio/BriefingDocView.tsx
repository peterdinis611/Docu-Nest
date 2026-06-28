import { AlertCircle, FileText, Lightbulb, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BriefingDocData {
  notebookTitle: string
  generatedAt: string
  executiveSummary: string
  sourceCount: number
  highlights: Array<{
    id: string
    title: string
    type: string
    summary: string
    keyPoint: string
  }>
  recommendations: string[]
  coverageGaps: string[]
}

interface BriefingDocViewProps {
  briefing: BriefingDocData
}

export function BriefingDocView({ briefing }: BriefingDocViewProps) {
  const generatedLabel = new Date(briefing.generatedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section className="overflow-hidden rounded-2xl border border-slate-500/20 bg-gradient-to-br from-slate-500/8 via-card to-background">
        <div className="border-b border-border/60 px-5 py-4 lg:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-slate-500/15 text-slate-600 dark:text-slate-300">
                  <FileText className="size-4" />
                </div>
                <Badge variant="outline" className="h-6 px-2 text-[10px] font-normal">
                  Executive briefing
                </Badge>
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                {briefing.notebookTitle}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Generated {generatedLabel}
              </p>
            </div>
            <Badge variant="secondary" className="h-7 px-3 text-xs tabular-nums">
              {briefing.sourceCount} active source{briefing.sourceCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        <div className="px-5 py-5 lg:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Executive summary
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90 lg:text-base">
            {briefing.executiveSummary}
          </p>
        </div>
      </section>

      {briefing.highlights.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Source highlights</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {briefing.highlights.map((highlight, index) => (
              <article
                key={highlight.id}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm",
                  index === 0 && "sm:col-span-2 border-slate-500/25 bg-slate-500/5"
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{highlight.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {highlight.type}
                    </p>
                  </div>
                  {index === 0 && (
                    <Badge className="h-5 shrink-0 bg-slate-600/90 text-[9px] hover:bg-slate-600/90">
                      Top signal
                    </Badge>
                  )}
                </div>

                <div className="mb-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Key point
                  </p>
                  <p className="mt-1 text-xs leading-relaxed">{highlight.keyPoint}</p>
                </div>

                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {highlight.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Recommended next steps</h3>
          </div>
          <ol className="space-y-2.5">
            {briefing.recommendations.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-foreground/90">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {briefing.coverageGaps.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold">Coverage notes</h3>
            </div>
            <ul className="space-y-2">
              {briefing.coverageGaps.map((gap) => (
                <li
                  key={gap}
                  className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
