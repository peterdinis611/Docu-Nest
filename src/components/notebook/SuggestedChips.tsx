import { ArrowRight } from "lucide-react"

interface SuggestedChipsProps {
  questions: string[]
  onSelect: (question: string) => void
}

export function SuggestedChips({ questions, onSelect }: SuggestedChipsProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">
        Suggested questions
      </p>
      <div className="flex flex-col gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3.5 text-left text-sm transition-all hover:border-primary/30 hover:bg-card hover:shadow-sm"
          >
            <span className="min-w-0 flex-1 leading-snug">{question}</span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        ))}
      </div>
    </div>
  )
}
