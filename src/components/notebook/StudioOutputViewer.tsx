import { ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StudioOutput } from "@/types"

interface StudioOutputViewerProps {
  output: StudioOutput
  onBack: () => void
}

export function StudioOutputViewer({ output, onBack }: StudioOutputViewerProps) {
  const isAudio = output.type === "audio-overview"

  return (
    <div className="flex flex-col px-3 pb-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-3 h-8 w-fit gap-1 px-2 text-xs"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" />
        Back
      </Button>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">{output.title}</h3>
          {output.duration && (
            <p className="text-xs text-muted-foreground">{output.duration}</p>
          )}
        </div>

        {isAudio && (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Play className="size-4" />
            </button>
            <div className="h-1.5 flex-1 rounded-full bg-muted">
              <div className="h-full w-1/3 rounded-full bg-primary" />
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-card p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {output.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
