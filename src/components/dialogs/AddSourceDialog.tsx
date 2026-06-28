"use client"

import type { ReactNode } from "react"
import { useCallback, useRef, useState } from "react"
import { FileText, Globe, Link2, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUploadThing } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"
import type { SourceDocument } from "@/types"

type SourceType = "upload" | "url" | "paste"

interface AddSourceDialogProps {
  notebookId: string
  defaultTab?: SourceType
  onSourceAdded?: (source: SourceDocument) => void
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddSourceDialog({
  notebookId,
  defaultTab = "upload",
  onSourceAdded,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AddSourceDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [internalOpen, setInternalOpen] = useState(false)
  const [sourceType, setSourceType] = useState<SourceType>(defaultTab)
  const [isDragging, setIsDragging] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const { startUpload, isUploading } = useUploadThing("notebookSourceUploader", {
    onClientUploadComplete: (files) => {
      const added = files
        .map((file) => file.serverData?.source)
        .filter((source): source is NonNullable<typeof source> => Boolean(source))
        .map(
          (source): SourceDocument => ({
            id: source.id,
            title: source.title,
            type: source.type,
            description: source.description,
            pageCount: source.pageCount ?? undefined,
            uploadedAt: source.uploadedAt,
            enabled: source.enabled,
            fileKey: source.fileKey ?? undefined,
            fileUrl: source.fileUrl ?? undefined,
            mimeType: source.mimeType ?? undefined,
            originalName: source.originalName ?? undefined,
          })
        )

      for (const source of added) {
        onSourceAdded?.(source)
      }

      if (added.length === 1) {
        toast.success("Source uploaded", {
          description: `"${added[0].title}" was added to this notebook.`,
        })
      } else if (added.length > 1) {
        toast.success("Sources uploaded", {
          description: `${added.length} files were added to this notebook.`,
        })
      }

      setOpen(false)
    },
    onUploadError: (error) => {
      toast.error(error.message || "Upload failed. Please try again.")
    },
  })

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files)
      if (list.length === 0 || isUploading) return

      void startUpload(list, { notebookId })
    },
    [isUploading, notebookId, startUpload]
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSourceType(defaultTab)
      setIsDragging(false)
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
          <DialogDescription>
            Upload a file, paste a URL, or add text to your notebook.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { type: "upload" as const, icon: Upload, label: "Upload" },
              { type: "url" as const, icon: Link2, label: "URL" },
              { type: "paste" as const, icon: FileText, label: "Paste" },
            ] as const
          ).map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSourceType(type)}
              disabled={isUploading}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors",
                sourceType === type
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-accent"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {sourceType === "upload" && (
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              if (event.dataTransfer.files.length > 0) {
                uploadFiles(event.dataTransfer.files)
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30"
            )}
          >
            {isUploading ? (
              <Loader2 className="mb-3 size-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="mb-3 size-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {isUploading ? "Uploading…" : "Drop files here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, TXT, MD — up to 32 MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,text/plain,application/pdf"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  uploadFiles(event.target.files)
                  event.target.value = ""
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "Uploading…" : "Browse files"}
            </Button>
          </div>
        )}

        {sourceType === "url" && (
          <div className="space-y-2">
            <label htmlFor="source-url" className="text-sm font-medium">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="source-url"
                placeholder="https://example.com/article"
                className="pl-9"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              URL imports are coming soon. Use Upload for now.
            </p>
          </div>
        )}

        {sourceType === "paste" && (
          <div className="space-y-2">
            <label htmlFor="source-paste" className="text-sm font-medium">
              Paste text
            </label>
            <textarea
              id="source-paste"
              rows={5}
              placeholder="Paste article text, notes, or excerpts…"
              disabled
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />
            <p className="text-xs text-muted-foreground">
              Paste imports are coming soon. Use Upload for now.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
