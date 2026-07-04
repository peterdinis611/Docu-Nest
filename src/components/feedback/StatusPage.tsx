"use client"

import Link from "next/link"
import {
  AlertTriangle,
  BookX,
  FileQuestion,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import {
  MotionIconBadge,
  Stagger,
  StaggerItem,
} from "@/components/motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type StatusIconName =
  | "sparkles"
  | "file-question"
  | "book-x"
  | "alert-triangle"

const iconMap: Record<StatusIconName, LucideIcon> = {
  sparkles: Sparkles,
  "file-question": FileQuestion,
  "book-x": BookX,
  "alert-triangle": AlertTriangle,
}

interface StatusPageProps {
  code?: string
  title: string
  description: string
  icon?: StatusIconName
  actions?: React.ReactNode
  variant?: "embedded" | "fullscreen"
  className?: string
}

export function StatusPage({
  code,
  title,
  description,
  icon = "sparkles",
  actions,
  variant = "embedded",
  className,
}: StatusPageProps) {
  const Icon = iconMap[icon]

  return (
    <div
      className={cn(
        "flex items-center justify-center px-6 py-16",
        variant === "fullscreen" ? "min-h-screen bg-background" : "min-h-[60vh]",
        className
      )}
    >
      <Stagger className="w-full max-w-md space-y-6 text-center">
        <StaggerItem>
          <MotionIconBadge className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-muted/40 shadow-sm">
            {code ? (
              <span className="text-lg font-semibold tabular-nums text-muted-foreground">
                {code}
              </span>
            ) : (
              <Icon className="size-6 text-muted-foreground" aria-hidden />
            )}
          </MotionIconBadge>
        </StaggerItem>

        <StaggerItem className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </StaggerItem>

        <StaggerItem>
          {actions ?? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <Link href="/app">Back to home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Sign in</Link>
              </Button>
            </div>
          )}
        </StaggerItem>
      </Stagger>
    </div>
  )
}
