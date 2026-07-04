import { ArrowLeft } from "lucide-react"
import { StudioContentView } from "@/components/notebook/studio/StudioContentView"
import { Button } from "@/components/ui/button"
import { parseStudioContent } from "@/lib/studio/content"
import type { StudioOutput } from "@/types"

interface StudioOutputViewerProps {
  output: StudioOutput
  onBack: () => void
}

/** @deprecated Use StudioWorkspacePreview in the main workspace instead. */
export function StudioOutputViewer({ output, onBack }: StudioOutputViewerProps) {
  const parsed = parseStudioContent(output.content, output.type)

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

        <StudioContentView content={parsed} variant="compact" />
      </div>
    </div>
  )
}
