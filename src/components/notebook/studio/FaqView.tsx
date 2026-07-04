"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FaqViewProps {
  items: Array<{
    id: string
    question: string
    answer: string
    sourceTitle?: string
  }>
}

export function FaqView({ items }: FaqViewProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/8 via-card to-background p-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <HelpCircle className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Frequently asked questions</p>
          <p className="text-xs text-muted-foreground">{items.length} answers from your sources</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = openId === item.id

          return (
            <div
              key={item.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-card transition-colors",
                isOpen && "border-amber-500/25"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/30"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  Q
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{item.question}</p>
                  {item.sourceTitle && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {item.sourceTitle}
                    </p>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t bg-muted/20 px-4 pb-4 pt-3 pl-[3.25rem]">
                  <p className="text-sm leading-relaxed text-foreground/90">{item.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
