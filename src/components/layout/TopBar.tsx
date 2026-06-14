import { ChevronDown, PanelLeft, PanelRight, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Notebook } from "@/types"

interface TopBarProps {
  notebook?: Notebook
  notebooks: Notebook[]
  enabledCount: number
  totalSources: number
  onSelectNotebook: (id: string) => void
  onToggleSources: () => void
  onToggleStudio: () => void
}

export function TopBar({
  notebook,
  notebooks,
  enabledCount,
  totalSources,
  onSelectNotebook,
  onToggleSources,
  onToggleStudio,
}: TopBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-panel px-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={onToggleSources}
        >
          <PanelLeft className="size-4" />
        </Button>

        <div className="relative">
          <select
            value={notebook?.id ?? ""}
            onChange={(e) => onSelectNotebook(e.target.value)}
            className="appearance-none rounded-lg bg-transparent py-1 pl-2 pr-7 text-sm font-medium hover:bg-accent"
          >
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.title}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {enabledCount} of {totalSources} sources selected
        </span>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
          <Share2 className="size-3.5" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          onClick={onToggleStudio}
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
    </header>
  )
}
