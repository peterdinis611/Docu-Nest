"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { updateSourceAction } from "@/actions/sources"
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
import { Textarea } from "@/components/ui/textarea"
import type { SourceDocument } from "@/types"

interface EditSourceDialogProps {
  notebookId: string
  source: SourceDocument
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUpdated?: (source: SourceDocument) => void
}

export function EditSourceDialog({
  notebookId,
  source,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onUpdated,
}: EditSourceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState(source.title)
  const [description, setDescription] = useState(source.description)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  useEffect(() => {
    if (open) {
      setTitle(source.title)
      setDescription(source.description)
    }
  }, [open, source.description, source.title])

  const { execute, isExecuting, result, reset } = useAction(updateSourceAction, {
    onSuccess: ({ data }) => {
      toast.success("Source updated")
      onUpdated?.(data.source)
      reset()
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(
        typeof error.serverError === "string"
          ? error.serverError
          : "Failed to update source"
      )
    },
  })

  const titleError = result.validationErrors?.title?._errors?.[0]
  const descriptionError = result.validationErrors?.description?._errors?.[0]
  const canSubmit = title.trim().length > 0 && !isExecuting

  function handleSave() {
    execute({
      notebookId,
      sourceId: source.id,
      title: title.trim(),
      description: description.trim(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset()
        setOpen(nextOpen)
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit source</DialogTitle>
          <DialogDescription>
            Update how this document appears in your notebook and library.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <label htmlFor="source-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="source-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(titleError)}
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="source-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="source-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            {descriptionError && (
              <p className="text-xs text-destructive">{descriptionError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExecuting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSubmit}>
            {isExecuting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
