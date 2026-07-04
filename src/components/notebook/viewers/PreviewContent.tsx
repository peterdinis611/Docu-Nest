"use client"

import dynamic from "next/dynamic"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFilePreviewMode } from "@/lib/file-preview"
import type { SourceDocument } from "@/types"
import { ImageViewer } from "./ImageViewer"
import { MarkdownViewer } from "./MarkdownViewer"
import { PreviewEmptyState, PreviewLoadingState } from "./shared"
import { TextViewer } from "./TextViewer"

const PdfViewer = dynamic(
  () => import("./PdfViewer").then((module) => module.PdfViewer),
  {
    ssr: false,
    loading: () => <PreviewLoadingState label="Loading PDF viewer…" />,
  }
)

interface PreviewContentProps {
  document: SourceDocument
  zoom: number
  onDownload?: () => void
  isDownloading?: boolean
}

export function PreviewContent({
  document,
  zoom,
  onDownload,
  isDownloading,
}: PreviewContentProps) {
  const mode = getFilePreviewMode(document)
  const fileUrl = document.fileUrl

  if (mode === "none") {
    return (
      <PreviewEmptyState
        title="No file attached"
        description="This source has metadata only. Upload a file to preview it here."
      />
    )
  }

  if (!fileUrl) {
    return (
      <PreviewEmptyState
        title="Preview unavailable"
        description="This source does not have a downloadable file URL."
      />
    )
  }

  switch (mode) {
    case "pdf":
      return <PdfViewer src={fileUrl} title={document.title} />

    case "image":
      return <ImageViewer src={fileUrl} alt={document.title} />

    case "markdown":
      return <MarkdownViewer src={fileUrl} zoom={zoom} />

    case "text":
      return <TextViewer source={document} src={fileUrl} zoom={zoom} />

    case "unsupported":
      return (
        <PreviewEmptyState
          title="Preview not supported"
          description="Open or download the original file."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {onDownload && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                  onClick={onDownload}
                  disabled={isDownloading}
                >
                  <Download className="size-3.5" />
                  Download
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  Open file
                </a>
              </Button>
            </div>
          }
        />
      )

    default:
      return null
  }
}
