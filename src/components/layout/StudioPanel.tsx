import {
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  Layers,
  Network,
  Wand2,
} from "lucide-react"
import { SavedNotesList } from "@/components/notebook/SavedNotesList"
import { StudioGrid } from "@/components/notebook/StudioGrid"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { SavedNote, StudioOutput, StudioOutputType } from "@/types"

const iconMap = {
  Headphones,
  GraduationCap,
  FileText,
  HelpCircle,
  Clock,
  Network,
  Layers,
}

interface StudioPanelProps {
  studioOutputs: StudioOutput[]
  activeStudioOutput?: StudioOutput
  savedNotes: SavedNote[]
  activeSavedNoteId?: string | null
  generatingStudioType: StudioOutputType | null
  enabledSourceCount: number
  onGenerate: (type: StudioOutputType) => void
  onSelectOutput: (id: string | null) => void
  onSelectSavedNote?: (id: string) => void
  onDeleteSavedNote?: (id: string) => void
}

export function StudioPanel({
  studioOutputs,
  activeStudioOutput,
  savedNotes,
  activeSavedNoteId,
  generatingStudioType,
  enabledSourceCount,
  onGenerate,
  onSelectOutput,
  onSelectSavedNote,
  onDeleteSavedNote,
}: StudioPanelProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l bg-card">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div>
          <div className="flex items-center gap-1.5">
            <Wand2 className="size-3.5 text-primary" />
            <h2 className="text-sm font-semibold">Studio</h2>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Generate from your sources
          </p>
        </div>
        {studioOutputs.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {studioOutputs.length}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 px-4 pb-5">
          {activeStudioOutput && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{activeStudioOutput.title}</span>{" "}
              is open in the main workspace.
            </p>
          )}

          {enabledSourceCount === 0 && (
            <p className="rounded-lg border border-dashed px-3 py-2 text-[11px] text-muted-foreground">
              Enable at least one source to generate studio outputs.
            </p>
          )}

          <StudioGrid
            generatingType={generatingStudioType}
            disabled={enabledSourceCount === 0}
            onGenerate={onGenerate}
            iconMap={iconMap}
          />

          {studioOutputs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Generated</p>
                {studioOutputs.map((output) => {
                  const isActive = output.id === activeStudioOutput?.id

                  return (
                    <button
                      key={output.id}
                      type="button"
                      onClick={() => onSelectOutput(output.id)}
                      className={cn(
                        "w-full rounded-xl border border-border/60 bg-background px-3.5 py-3 text-left transition-all hover:border-primary/30 hover:shadow-sm",
                        isActive && "border-primary/40 bg-primary/5 shadow-sm"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{output.title}</p>
                        {isActive && (
                          <Badge
                            variant="outline"
                            className="h-5 shrink-0 px-1.5 text-[9px]"
                          >
                            Open
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {output.duration ? `${output.duration} · ` : ""}
                        {new Date(output.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <Separator />

          <SavedNotesList
            notes={savedNotes}
            activeNoteId={activeSavedNoteId}
            onSelect={onSelectSavedNote}
            onDelete={onDeleteSavedNote}
          />
        </div>
      </ScrollArea>
    </aside>
  )
}
