interface SuggestedChipsProps {
  questions: string[]
  onSelect: (question: string) => void
}

export function SuggestedChips({ questions, onSelect }: SuggestedChipsProps) {
  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-muted-foreground">
        Suggested questions
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onSelect(question)}
            className="rounded-full border bg-card px-3.5 py-2 text-left text-sm transition-colors hover:border-primary/30 hover:bg-accent"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
