import { Sparkles } from "lucide-react"

interface SourceGuideProps {
  guide: string
  sourceCount: number
}

export function SourceGuide({ guide, sourceCount }: SourceGuideProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-sm font-medium">Source guide</h2>
        <span className="text-xs text-muted-foreground">
          · {sourceCount} selected
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{guide}</p>
    </div>
  )
}
