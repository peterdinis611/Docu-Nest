"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { PreviewContent } from "@/components/notebook/viewers/PreviewContent"
import { SourceActionsMenu } from "@/components/notebook/SourceActionsMenu"
import { EditSourceDialog } from "@/components/dialogs/EditSourceDialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fileName,
  fileTypeLabels,
  getFilePreviewMode,
  hasBuiltInZoom,
} from "@/lib/file-preview"
import { downloadRemoteFile } from "@/lib/download-file"
import { clamp, roundTo } from "@/lib/math"
import type { SourceDocument } from "@/types"

interface FileViewerProps {
  document: SourceDocument
  documents?: SourceDocument[]
  notebookId?: string
  onClose: () => void
  onSelectDocument?: (id: string) => void
  onFocusChatDocument?: (id: string) => void
  onSourceUpdated?: (source: SourceDocument) => void
  onSourceDeleted?: (sourceId: string) => void
}

const ZOOM_MIN = 0.6
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1

const previewModeLabels = {
  pdf: "PDF (EmbedPDF)",
  markdown: "Markdown",
  text: "Syntax-highlighted text",
  image: "Image (zoom & pan)",
  unsupported: "Not supported",
  none: "None",
} as const

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2.5 text-sm last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all text-right font-medium">{value}</span>
    </div>
  )
}

export function FileViewer({
  document,
  documents = [],
  notebookId,
  onClose,
  onSelectDocument,
  onFocusChatDocument,
  onSourceUpdated,
  onSourceDeleted,
}: FileViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)

  const mode = getFilePreviewMode(document)
  const fileUrl = document.fileUrl
  const name = fileName(document)
  const showZoomControls = hasBuiltInZoom(mode)

  const navigable = useMemo(
    () => documents.filter((doc) => doc.fileUrl),
    [documents]
  )
  const currentIndex = navigable.findIndex((doc) => doc.id === document.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < navigable.length - 1

  useEffect(() => {
    setZoom(1)
  }, [document.id])

  function changeZoom(delta: number) {
    setZoom((value) => roundTo(clamp(value + delta, ZOOM_MIN, ZOOM_MAX), 1))
  }

  function goTo(offset: number) {
    const next = navigable[currentIndex + offset]
    if (next) onSelectDocument?.(next.id)
  }

  async function handleDownload() {
    if (!fileUrl) return

    setIsDownloading(true)
    try {
      await downloadRemoteFile(fileUrl, name)
      toast.success("Download started", { description: name })
    } catch {
      toast.error("Could not download file", {
        description: "Try opening the file in a new tab instead.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {navigable.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                disabled={!hasPrev}
                onClick={() => goTo(-1)}
                aria-label="Previous file"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                disabled={!hasNext}
                onClick={() => goTo(1)}
                aria-label="Next file"
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          )}
          <div className="min-w-0 px-1">
            <p className="truncate text-sm font-medium">{document.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {fileTypeLabels[document.type]}
              {navigable.length > 1 && currentIndex >= 0
                ? ` · ${currentIndex + 1} / ${navigable.length}`
                : ""}
            </p>
          </div>
        </div>

        {showZoomControls && (
          <div className="flex items-center gap-0.5 rounded-md border bg-muted/30 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => changeZoom(-ZOOM_STEP)}
              disabled={zoom <= ZOOM_MIN}
              aria-label="Zoom out"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-[11px] tabular-nums text-muted-foreground">
              {roundTo(zoom * 100, 0)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => changeZoom(ZOOM_STEP)}
              disabled={zoom >= ZOOM_MAX}
              aria-label="Zoom in"
            >
              <Plus className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setZoom(1)}
              aria-label="Reset zoom"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        )}

        {fileUrl && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden h-8 gap-1.5 text-xs sm:inline-flex"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 sm:hidden"
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Download file"
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <a href={fileUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                <span className="sr-only">Open in new tab</span>
              </a>
            </Button>
          </>
        )}

        {onFocusChatDocument && (
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 gap-1.5 text-xs sm:inline-flex"
            onClick={() => onFocusChatDocument(document.id)}
          >
            <MessageSquare className="size-3.5" />
            Ask about file
          </Button>
        )}

        <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <Tabs defaultValue="preview" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-3 py-2">
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="gap-1.5 text-xs">
              <FileText className="size-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-1.5 text-xs">
              <Info className="size-3.5" />
              Details
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="min-h-full bg-muted/20 p-4">
              <PreviewContent
                document={document}
                zoom={zoom}
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="details" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-lg space-y-4 p-6">
              <p className="text-sm text-muted-foreground">{document.description}</p>
              <div className="rounded-lg border bg-card px-4 py-1">
                <DetailRow label="Title" value={document.title} />
                <DetailRow label="File name" value={name} />
                <DetailRow label="Type" value={fileTypeLabels[document.type]} />
                <DetailRow label="Preview" value={previewModeLabels[mode]} />
                {document.mimeType && (
                  <DetailRow label="MIME" value={document.mimeType} />
                )}
                <DetailRow
                  label="Uploaded"
                  value={new Date(document.uploadedAt).toLocaleString()}
                />
                <DetailRow
                  label="Status"
                  value={document.enabled ? "Active in chat" : "Disabled"}
                />
                {document.fileKey && (
                  <DetailRow label="UploadThing ID" value={document.fileKey} />
                )}
                {document.fileSize != null && (
                  <DetailRow
                    label="Size"
                    value={formatFileSize(document.fileSize)}
                  />
                )}
                {fileUrl && <DetailRow label="URL" value={fileUrl} />}
              </div>
              {fileUrl && (
                <Button
                  className="w-full gap-2"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download file
                </Button>
              )}
              {notebookId && onSourceUpdated && (
                <div className="flex gap-2">
                  <EditSourceDialog
                    notebookId={notebookId}
                    source={document}
                    onUpdated={onSourceUpdated}
                    trigger={
                      <Button variant="outline" className="flex-1">
                        Edit details
                      </Button>
                    }
                  />
                  {onSourceDeleted && (
                    <SourceActionsMenu
                      notebookId={notebookId}
                      source={document}
                      onUpdated={onSourceUpdated}
                      onDeleted={(sourceId) => {
                        onSourceDeleted(sourceId)
                        onClose()
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
