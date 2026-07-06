"use client"

import type { ReactNode } from "react"
import { useCallback, useRef, useState } from "react"
import { FileText, Globe, Link2, Loader2, Upload } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
  createSourceFromPasteAction,
  createSourceFromUploadAction,
  createSourceFromUrlAction,
} from "@/actions/sources"
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
  const [urlValue, setUrlValue] = useState("")
  const [pasteTitle, setPasteTitle] = useState("")
  const [pasteText, setPasteText] = useState("")
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const handleSourceSaved = useCallback(
    (source: SourceDocument, label: string) => {
      onSourceAdded?.(source)
      toast.success(label, { description: `"${source.title}" was added to this notebook.` })
      setOpen(false)
      setUrlValue("")
      setPasteTitle("")
      setPasteText("")
    },
    [onSourceAdded, setOpen]
  )

  const { executeAsync: saveUploadedSource, isExecuting: isSavingUpload } = useAction(
    createSourceFromUploadAction,
    {
      onError: ({ error }) => {
        toast.error(
          typeof error.serverError === "string"
            ? error.serverError
            : "Failed to save uploaded file."
        )
      },
    }
  )

  const { executeAsync: savePasteSource, isExecuting: isSavingPaste } = useAction(
    createSourceFromPasteAction,
    {
      onError: ({ error }) => {
        toast.error(
          typeof error.serverError === "string"
            ? error.serverError
            : "Failed to save pasted text."
        )
      },
    }
  )

  const { executeAsync: saveUrlSource, isExecuting: isSavingUrl } = useAction(
    createSourceFromUrlAction,
    {
      onError: ({ error }) => {
        toast.error(
          typeof error.serverError === "string"
            ? error.serverError
            : "Failed to import URL."
        )
      },
    }
  )

  const { startUpload, isUploading } = useUploadThing("notebookSourceUploader", {
    onClientUploadComplete: async (files) => {
      const saved = []

      for (const file of files) {
        const result = await saveUploadedSource({
          notebookId,
          uploadthingFileId: file.key,
          fileUrl: file.url,
          originalName: file.name,
          mimeType: file.type || undefined,
          fileSize: file.size,
        })

        if (result.data?.source) {
          saved.push(result.data.source)
        }
      }

      if (saved.length === 1) {
        handleSourceSaved(saved[0]!, "Source uploaded")
      } else if (saved.length > 1) {
        saved.forEach((source) => onSourceAdded?.(source))
        toast.success("Sources uploaded", {
          description: `${saved.length} files were saved to this notebook.`,
        })
        setOpen(false)
      }
    },
    onUploadError: (error) => {
      toast.error(error.message || "Upload failed. Please try again.")
    },
  })

  const isBusy = isUploading || isSavingUpload || isSavingPaste || isSavingUrl

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files)
      if (list.length === 0 || isBusy) return

      void startUpload(list, { notebookId })
    },
    [isBusy, notebookId, startUpload]
  )

  const handlePasteSubmit = async () => {
    if (!pasteText.trim() || isBusy) return

    const result = await savePasteSource({
      notebookId,
      title: pasteTitle.trim() || undefined,
      text: pasteText.trim(),
    })

    if (result.data?.source) {
      handleSourceSaved(result.data.source, "Note added")
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlValue.trim() || isBusy) return

    const result = await saveUrlSource({
      notebookId,
      url: urlValue.trim(),
    })

    if (result.data?.source) {
      handleSourceSaved(result.data.source, "URL imported")
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSourceType(defaultTab)
      setIsDragging(false)
      setUrlValue("")
      setPasteTitle("")
      setPasteText("")
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
              disabled={isBusy}
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
            {isBusy ? (
              <Loader2 className="mb-3 size-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="mb-3 size-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              {isUploading ? "Uploading…" : isSavingUpload ? "Indexing…" : "Drop files here"}
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
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              {isBusy ? "Working…" : "Browse files"}
            </Button>
          </div>
        )}

        {sourceType === "url" && (
          <div className="space-y-3">
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
                  value={urlValue}
                  disabled={isBusy}
                  onChange={(event) => setUrlValue(event.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We extract the main article text and index it for chat.
              </p>
            </div>
            <Button
              className="w-full"
              disabled={isBusy || !urlValue.trim()}
              onClick={() => void handleUrlSubmit()}
            >
              {isSavingUrl ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing…
                </>
              ) : (
                "Import URL"
              )}
            </Button>
          </div>
        )}

        {sourceType === "paste" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="source-paste-title" className="text-sm font-medium">
                Title (optional)
              </label>
              <Input
                id="source-paste-title"
                placeholder="e.g. Meeting notes"
                value={pasteTitle}
                disabled={isBusy}
                onChange={(event) => setPasteTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="source-paste" className="text-sm font-medium">
                Paste text
              </label>
              <textarea
                id="source-paste"
                rows={5}
                placeholder="Paste article text, notes, or excerpts…"
                disabled={isBusy}
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>
            <Button
              className="w-full"
              disabled={isBusy || !pasteText.trim()}
              onClick={() => void handlePasteSubmit()}
            >
              {isSavingPaste ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add note"
              )}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
