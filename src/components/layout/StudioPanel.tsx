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
import { StudioOutputViewer } from "@/components/notebook/StudioOutputViewer"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  generatingStudioType: StudioOutputType | null
  onGenerate: (type: StudioOutputType) => void
  onSelectOutput: (id: string | null) => void
}

export function StudioPanel({
  studioOutputs,
  activeStudioOutput,
  savedNotes,
  generatingStudioType,
  onGenerate,
  onSelectOutput,
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
        {activeStudioOutput ? (
          <StudioOutputViewer
            output={activeStudioOutput}
            onBack={() => onSelectOutput(null)}
          />
        ) : (
          <div className="space-y-5 px-4 pb-5">
            <StudioGrid
              generatingType={generatingStudioType}
              onGenerate={onGenerate}
              iconMap={iconMap}
            />

            {studioOutputs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Generated
                  </p>
                  {studioOutputs.map((output) => (
                    <button
                      key={output.id}
                      type="button"
                      onClick={() => onSelectOutput(output.id)}
                      className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <p className="text-sm font-medium">{output.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {output.duration ? `${output.duration} · ` : ""}
                        {new Date(output.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            <Separator />

            <SavedNotesList notes={savedNotes} />
          </div>
        )}
      </ScrollArea>
    </aside>
  )
}
