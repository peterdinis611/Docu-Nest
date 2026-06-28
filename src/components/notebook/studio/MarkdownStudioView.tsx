interface MarkdownStudioViewProps {
  content: string
}

export function MarkdownStudioView({ content }: MarkdownStudioViewProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
        {content}
      </pre>
    </div>
  )
}
