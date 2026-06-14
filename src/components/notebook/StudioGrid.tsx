import type { ComponentType } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { STUDIO_TEMPLATES, type StudioOutputType } from "@/types"

interface StudioGridProps {
  generatingType: StudioOutputType | null
  onGenerate: (type: StudioOutputType) => void
  iconMap: Record<string, ComponentType<{ className?: string }>>
}

export function StudioGrid({
  generatingType,
  onGenerate,
  iconMap,
}: StudioGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STUDIO_TEMPLATES.map((template) => {
        const Icon = iconMap[template.icon]
        const isGenerating = generatingType === template.type

        return (
          <button
            key={template.type}
            type="button"
            disabled={generatingType !== null}
            onClick={() => onGenerate(template.type)}
            className={cn(
              "flex flex-col items-start rounded-xl border bg-card p-3 text-left transition-colors",
              "hover:border-primary/30 hover:bg-accent disabled:opacity-60",
              isGenerating && "border-primary/40 bg-accent"
            )}
          >
            <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-muted">
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                Icon && <Icon className="size-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs font-medium leading-tight">{template.label}</p>
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
              {template.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
