import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SourceGuideProps {
  guide: string
  sourceCount: number
}

export function SourceGuide({ guide, sourceCount }: SourceGuideProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b bg-muted/40 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md border bg-background">
              <Sparkles className="size-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Source guide</span>
          </div>
          <Badge variant="secondary">
            {sourceCount} selected
          </Badge>
        </div>
      </div>
      <p className="px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        {guide}
      </p>
    </div>
  )
}
