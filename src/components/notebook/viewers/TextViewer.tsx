"use client"

import { useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism"
import { useRemoteText } from "@/hooks/useRemoteText"
import { getSyntaxLanguage } from "@/lib/file-preview"
import { cn } from "@/lib/utils"
import type { SourceDocument } from "@/types"
import { PreviewEmptyState, PreviewLoadingState } from "./shared"

interface TextViewerProps {
  source: SourceDocument
  src: string
  zoom?: number
  className?: string
}

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains("dark"))

    update()

    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onMediaChange = () => {
      if (!root.classList.contains("dark") && !root.classList.contains("light")) {
        setIsDark(media.matches)
      }
    }

    media.addEventListener("change", onMediaChange)

    return () => {
      observer.disconnect()
      media.removeEventListener("change", onMediaChange)
    }
  }, [])

  return isDark
}

export function TextViewer({
  source,
  src,
  zoom = 1,
  className,
}: TextViewerProps) {
  const { content, error, isLoading } = useRemoteText(src, true)
  const isDark = useIsDarkMode()
  const language = getSyntaxLanguage(source)

  if (isLoading) {
    return <PreviewLoadingState label="Loading text…" />
  }

  if (error || content == null) {
    return (
      <PreviewEmptyState
        title="Preview unavailable"
        description={error ?? "Could not load text content."}
      />
    )
  }

  return (
    <div
      className={cn("mx-auto max-w-4xl origin-top transition-transform", className)}
      style={{ transform: `scale(${zoom})` }}
    >
      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={content.split("\n").length > 8}
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "transparent",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
          }}
          codeTagProps={{
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            },
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
