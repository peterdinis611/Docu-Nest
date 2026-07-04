"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { updateNotebookAction } from "@/actions/notebooks"
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
import type { Notebook } from "@/types"

interface EditNotebookDialogProps {
  notebook: Pick<Notebook, "id" | "title" | "description">
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUpdated?: (notebook: Notebook) => void
}

export function EditNotebookDialog({
  notebook,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onUpdated,
}: EditNotebookDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState(notebook.title)
  const [description, setDescription] = useState(notebook.description ?? "")

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  useEffect(() => {
    if (open) {
      setTitle(notebook.title)
      setDescription(notebook.description ?? "")
    }
  }, [notebook.description, notebook.title, open])

  const { execute, isExecuting, result, reset } = useAction(updateNotebookAction, {
    onSuccess: ({ data }) => {
      toast.success("Notebook updated")
      onUpdated?.(data.notebook)
      reset()
      setOpen(false)
    },
    onError: ({ error }) => {
      toast.error(
        typeof error.serverError === "string"
          ? error.serverError
          : "Failed to update notebook"
      )
    },
  })

  const titleError = result.validationErrors?.title?._errors?.[0]
  const canSubmit = title.trim().length > 0 && !isExecuting

  function handleSave() {
    execute({
      notebookId: notebook.id,
      title: title.trim(),
      description: description.trim() || null,
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
          <DialogTitle>Edit notebook</DialogTitle>
          <DialogDescription>
            Change the title and description shown across the app.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <label htmlFor="edit-notebook-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="edit-notebook-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(titleError)}
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-notebook-desc" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="edit-notebook-desc"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
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
