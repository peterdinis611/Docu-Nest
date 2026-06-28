import type { ComponentType } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { STUDIO_TEMPLATES, type StudioOutputType } from "@/types"

const templateColors: Record<StudioOutputType, string> = {
  "audio-overview": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "study-guide": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "briefing-doc": "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  faq: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  timeline: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "mind-map": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  flashcards: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

interface StudioGridProps {
  generatingType: StudioOutputType | null
  disabled?: boolean
  onGenerate: (type: StudioOutputType) => void
  iconMap: Record<string, ComponentType<{ className?: string }>>
}

export function StudioGrid({
  generatingType,
  disabled = false,
  onGenerate,
  iconMap,
}: StudioGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {STUDIO_TEMPLATES.map((template) => {
        const Icon = iconMap[template.icon]
        const isGenerating = generatingType === template.type
        const colorClass = templateColors[template.type]
        const isDisabled = disabled || generatingType !== null

        return (
          <button
            key={template.type}
            type="button"
            disabled={isDisabled}
            onClick={() => onGenerate(template.type)}
            className={cn(
              "flex flex-col items-start rounded-xl border border-border/60 bg-background p-3.5 text-left transition-all",
              "hover:border-primary/25 hover:shadow-sm disabled:opacity-60",
              isGenerating && "border-primary/40 bg-primary/5 shadow-sm"
            )}
          >
            <div
              className={cn(
                "mb-2.5 flex size-9 items-center justify-center rounded-xl",
                colorClass
              )}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                Icon && <Icon className="size-4" />
              )}
            </div>
            <p className="text-xs font-semibold leading-tight">
              {template.label}
            </p>
            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
              {template.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
