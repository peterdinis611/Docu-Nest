"use client"

import { AlertCircle, Search, Sparkles } from "lucide-react"
import {
  FadeIn,
  MotionIconBadge,
  PresenceSwap,
} from "@/components/motion"

type SearchEmptyVariant = "idle" | "empty" | "error"

interface SearchEmptyStateProps {
  variant: SearchEmptyVariant
  query?: string
}

const copy: Record<
  SearchEmptyVariant,
  { title: string; description: string; icon: typeof Search }
> = {
  idle: {
    title: "Search DocuNest",
    description: "Find pages, notebooks, and documents instantly.",
    icon: Search,
  },
  empty: {
    title: "No matches found",
    description: "Try a different keyword or check the spelling.",
    icon: Search,
  },
  error: {
    title: "Search unavailable",
    description: "Something went wrong. Please try again in a moment.",
    icon: AlertCircle,
  },
}

export function SearchEmptyState({ variant, query }: SearchEmptyStateProps) {
  const { title, description, icon: Icon } = copy[variant]

  return (
    <PresenceSwap
      presentKey={variant + (query ?? "")}
      className="flex flex-col items-center justify-center px-6 py-10 text-center"
    >
      <MotionIconBadge className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
        <Icon
          className={
            variant === "error"
              ? "size-5 text-destructive"
              : "size-5 text-muted-foreground"
          }
        />
      </MotionIconBadge>

      <p className="text-sm font-medium text-foreground">{title}</p>

      {variant === "empty" && query ? (
        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
          Nothing matched{" "}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          . {description}
        </p>
      ) : (
        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {variant === "idle" && (
        <FadeIn delay={0.12} className="mt-5 flex flex-wrap justify-center gap-2">
          {["Home", "Library", "Notebooks"].map((hint) => (
            <span
              key={hint}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <Sparkles className="size-3 text-primary/70" />
              {hint}
            </span>
          ))}
        </FadeIn>
      )}
    </PresenceSwap>
  )
}
