import { Badge } from "@/components/ui/badge"
import type { TimelineEvent } from "@/lib/studio/types"

interface TimelineViewProps {
  events: TimelineEvent[]
}

export function TimelineView({ events }: TimelineViewProps) {
  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < events.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[7px] top-4 h-[calc(100%-4px)] w-px bg-border"
            />
          )}
          <div className="relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-emerald-500 bg-background" />
          <div className="min-w-0 flex-1 rounded-xl border bg-card p-3.5">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {event.date}
              </span>
              {event.sourceTitle && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                  {event.sourceTitle}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium">{event.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
