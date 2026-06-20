import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SourceGuideProps {
  guide: string
  sourceCount: number
}

export function SourceGuide({ guide, sourceCount }: SourceGuideProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-card shadow-sm">
      <div className="border-b border-primary/10 bg-primary/5 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Source guide</span>
          </div>
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
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
