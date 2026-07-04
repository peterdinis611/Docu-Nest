"use client"

import { Palette } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "@/hooks/useTheme"

export function AppearanceSection() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="size-4" />
          Appearance
        </CardTitle>
        <CardDescription>
          Theme preference is saved on this device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ThemeToggle variant="segmented" className="w-full sm:w-auto" />
        <p className="text-xs text-muted-foreground">
          Active:{" "}
          {theme === "system"
            ? `System (${resolvedTheme})`
            : theme.charAt(0).toUpperCase() + theme.slice(1)}
        </p>
      </CardContent>
    </Card>
  )
}
