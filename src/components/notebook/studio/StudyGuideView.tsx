"use client"

import { useState } from "react"
import { ChevronDown, GraduationCap, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StudyGuideViewProps {
  notebookTitle: string
  concepts: Array<{
    id: string
    term: string
    definition: string
    sourceTitle?: string
  }>
  reviewQuestions: string[]
}

export function StudyGuideView({
  notebookTitle,
  concepts,
  reviewQuestions,
}: StudyGuideViewProps) {
  const [openId, setOpenId] = useState<string | null>(concepts[0]?.id ?? null)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/8 via-card to-background p-5 lg:p-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <GraduationCap className="size-4" />
          </div>
          <Badge variant="outline" className="h-6 px-2 text-[10px] font-normal">
            Study guide
          </Badge>
        </div>
        <h2 className="text-lg font-semibold">{notebookTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {concepts.length} key concepts · {reviewQuestions.length} review questions
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Key concepts</h3>
        {concepts.map((concept) => {
          const isOpen = openId === concept.id

          return (
            <div key={concept.id} className="overflow-hidden rounded-xl border bg-card">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : concept.id)}
                className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{concept.term}</p>
                  {concept.sourceTitle && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {concept.sourceTitle}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t px-4 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {concept.definition}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </section>

      <section className="rounded-xl border bg-card p-4 lg:p-5">
        <h3 className="mb-3 text-sm font-semibold">Review questions</h3>
        <ol className="space-y-2.5">
          {reviewQuestions.map((question, index) => (
            <li key={question} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium tabular-nums">
                {index + 1}
              </span>
              <span className="pt-0.5">{question}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
