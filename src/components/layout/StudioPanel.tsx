import {
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  Layers,
  Network,
} from "lucide-react"
import { SavedNotesList } from "@/components/notebook/SavedNotesList"
import { StudioGrid } from "@/components/notebook/StudioGrid"
import { StudioOutputViewer } from "@/components/notebook/StudioOutputViewer"
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
    <aside className="flex h-full w-72 shrink-0 flex-col border-l bg-panel">
      <div className="px-4 py-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Studio
        </h2>
      </div>

      <ScrollArea className="flex-1">
        {activeStudioOutput ? (
          <StudioOutputViewer
            output={activeStudioOutput}
            onBack={() => onSelectOutput(null)}
          />
        ) : (
          <div className="space-y-4 px-3 pb-4">
            <StudioGrid
              generatingType={generatingStudioType}
              onGenerate={onGenerate}
              iconMap={iconMap}
            />

            {studioOutputs.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="px-1 text-xs font-medium text-muted-foreground">
                    Generated
                  </p>
                  {studioOutputs.map((output) => (
                    <button
                      key={output.id}
                      type="button"
                      onClick={() => onSelectOutput(output.id)}
                      className="w-full rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <p className="text-sm font-medium">{output.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {output.duration
                          ? `${output.duration} · `
                          : ""}
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
