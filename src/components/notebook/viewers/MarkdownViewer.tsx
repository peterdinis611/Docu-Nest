"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import { useRemoteText } from "@/hooks/useRemoteText"
import { cn } from "@/lib/utils"
import { PreviewEmptyState, PreviewLoadingState } from "./shared"

interface MarkdownViewerProps {
  src: string
  zoom?: number
  className?: string
}

export function MarkdownViewer({ src, zoom = 1, className }: MarkdownViewerProps) {
  const { content, error, isLoading } = useRemoteText(src, true)

  if (isLoading) {
    return <PreviewLoadingState label="Loading markdown…" />
  }

  if (error || !content) {
    return (
      <PreviewEmptyState
        title="Preview unavailable"
        description={error ?? "Could not load markdown content."}
      />
    )
  }

  return (
    <div
      className={cn("mx-auto max-w-3xl origin-top transition-transform", className)}
      style={{ transform: `scale(${zoom})` }}
    >
      <article className="rounded-lg border bg-background px-6 py-6 text-sm leading-relaxed shadow-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-4 border-b pb-2 text-2xl font-semibold tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-3 mt-6 text-xl font-semibold tracking-tight">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-5 text-lg font-medium">{children}</h3>
            ),
            p: ({ children }) => <p className="mb-3 text-foreground/90">{children}</p>,
            ul: ({ children }) => (
              <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="mb-3 border-l-2 border-primary/40 pl-4 text-muted-foreground">
                {children}
              </blockquote>
            ),
            code: ({ className: codeClassName, children }) => {
              const isBlock = codeClassName?.includes("language-")

              if (isBlock) {
                return (
                  <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
                    {children}
                  </code>
                )
              }

              return (
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre className="mb-3 overflow-x-auto rounded-md bg-muted p-3">{children}</pre>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="mb-3 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-border bg-muted px-3 py-2 font-medium">{children}</th>
            ),
            td: ({ children }) => (
              <td className="border border-border px-3 py-2">{children}</td>
            ),
            hr: () => <hr className="my-6 border-border" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
