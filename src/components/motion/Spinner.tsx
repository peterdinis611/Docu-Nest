import { cn } from "@/lib/utils"

const sizes = {
  sm: "size-4 border",
  md: "size-6 border-2",
  lg: "size-8 border-2",
  xl: "size-10 border-[3px]",
} as const

interface SpinnerProps {
  size?: keyof typeof sizes
  className?: string
  label?: string
}

export function Spinner({
  size = "md",
  className,
  label = "Loading",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-primary/25 border-t-primary",
        sizes[size],
        className
      )}
    />
  )
}

interface TypingIndicatorProps {
  label?: string
  className?: string
}

export function TypingIndicator({
  label = "Searching sources…",
  className,
}: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1" aria-hidden>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-primary/60"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
