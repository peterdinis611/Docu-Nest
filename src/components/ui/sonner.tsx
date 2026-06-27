"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useMounted } from "@/hooks/useMounted"
import { useTheme } from "@/hooks/useTheme"

export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()

  return (
    <Sonner
      theme={(mounted ? resolvedTheme : "light") as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
