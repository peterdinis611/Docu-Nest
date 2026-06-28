"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Flashcard } from "@/lib/studio/types"

interface FlashcardsViewProps {
  cards: Flashcard[]
}

function shuffleCards(items: Flashcard[]) {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function FlashcardsView({ cards }: FlashcardsViewProps) {
  const [deck, setDeck] = useState(cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set())

  const card = deck[index]
  const hasPrev = index > 0
  const hasNext = index < deck.length - 1
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0
  const allMastered = masteredIds.size === cards.length && cards.length > 0

  const remainingCount = useMemo(
    () => cards.length - masteredIds.size,
    [cards.length, masteredIds.size]
  )

  useEffect(() => {
    setDeck(cards)
    setIndex(0)
    setFlipped(false)
    setMasteredIds(new Set())
  }, [cards])

  const goTo = useCallback((nextIndex: number) => {
    setIndex(nextIndex)
    setFlipped(false)
  }, [])

  const resetDeck = useCallback(() => {
    setDeck(cards)
    setIndex(0)
    setFlipped(false)
    setMasteredIds(new Set())
  }, [cards])

  const shuffleDeck = useCallback(() => {
    setDeck(shuffleCards(cards))
    setIndex(0)
    setFlipped(false)
  }, [cards])

  const markMastered = useCallback(() => {
    if (!card) return

    setMasteredIds((current) => new Set(current).add(card.id))

    if (hasNext) {
      goTo(index + 1)
      return
    }

    if (hasPrev) {
      goTo(index - 1)
    }
  }, [card, goTo, hasNext, hasPrev, index])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault()
        setFlipped((value) => !value)
      }
      if (event.key === "ArrowRight" && hasNext) goTo(index + 1)
      if (event.key === "ArrowLeft" && hasPrev) goTo(index - 1)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goTo, hasNext, hasPrev, index])

  if (!card) {
    return (
      <p className="text-sm text-muted-foreground">No flashcards generated yet.</p>
    )
  }

  if (allMastered) {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Deck complete</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You reviewed all {cards.length} cards.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={resetDeck}>
          <RotateCcw className="size-3.5" />
          Study again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            Card {index + 1} of {deck.length}
          </span>
          <span className="tabular-nums">{remainingCount} left</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-center gap-1">
          {deck.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(dotIndex)}
              aria-label={`Go to card ${dotIndex + 1}`}
              className={cn(
                "size-1.5 rounded-full transition-all",
                dotIndex === index
                  ? "w-4 bg-orange-500"
                  : masteredIds.has(item.id)
                    ? "bg-emerald-500/70"
                    : "bg-muted-foreground/25 hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      </div>

      <div className="[perspective:1000px]">
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="group relative h-52 w-full [transform-style:preserve-3d] transition-transform duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            className={cn(
              "absolute inset-0 flex flex-col rounded-2xl border bg-card p-5 text-left shadow-sm [backface-visibility:hidden]",
              "border-orange-500/25 bg-gradient-to-br from-orange-500/8 via-card to-card",
              "group-hover:shadow-md"
            )}
          >
            <span className="mb-3 inline-flex w-fit rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Question
            </span>
            <p className="flex-1 text-sm font-medium leading-relaxed">{card.front}</p>
            <p className="text-[10px] text-muted-foreground">Click or press Space to reveal</p>
          </div>

          <div
            className={cn(
              "absolute inset-0 flex flex-col rounded-2xl border bg-card p-5 text-left shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]",
              "border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 via-card to-card"
            )}
          >
            <span className="mb-3 inline-flex w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Answer
            </span>
            <p className="flex-1 text-sm leading-relaxed text-foreground/90">{card.back}</p>
            <p className="text-[10px] text-muted-foreground">Click to flip back</p>
          </div>
        </button>
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => {
              setFlipped(false)
              if (hasNext) goTo(index + 1)
            }}
          >
            Review again
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 bg-emerald-600 text-xs hover:bg-emerald-600/90"
            onClick={markMastered}
          >
            <Check className="size-3.5" />
            Got it
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          disabled={!hasPrev}
          onClick={() => goTo(index - 1)}
          aria-label="Previous card"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-xs"
          onClick={() => setFlipped((value) => !value)}
        >
          <RotateCcw className="size-3.5" />
          {flipped ? "Show question" : "Flip card"}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          disabled={!hasNext}
          onClick={() => goTo(index + 1)}
          aria-label="Next card"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-[11px] text-muted-foreground"
          onClick={shuffleDeck}
        >
          <Shuffle className="size-3.5" />
          Shuffle
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-[11px] text-muted-foreground"
          onClick={resetDeck}
        >
          <RotateCcw className="size-3.5" />
          Reset deck
        </Button>
      </div>
    </div>
  )
}
