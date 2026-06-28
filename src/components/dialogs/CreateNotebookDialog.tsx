"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { createNotebookAction } from "@/actions/notebooks"
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

interface CreateNotebookDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateNotebookDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateNotebookDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  function resetForm() {
    setTitle("")
    setDescription("")
  }

  const { execute, isExecuting, result, reset: resetAction } = useAction(
    createNotebookAction,
    {
      onSuccess: ({ data }) => {
        toast.success("Notebook created", {
          description: `"${data.title}" is ready to use.`,
        })
        resetForm()
        resetAction()
        ;(onOpenChange ?? setInternalOpen)(false)
        router.push(`/notebook/${data.id}`)
      },
      onError: ({ error }) => {
        const validationError =
          error.validationErrors?.title?._errors?.[0] ??
          error.validationErrors?.description?._errors?.[0]

        toast.error(
          validationError ??
            (typeof error.serverError === "string"
              ? error.serverError
              : "Failed to create notebook. Please try again.")
        )
      },
    }
  )

  const setOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
      resetAction()
    }
    ;(onOpenChange ?? setInternalOpen)(nextOpen)
  }

  const titleError = result.validationErrors?.title?._errors?.[0]
  const descriptionError = result.validationErrors?.description?._errors?.[0]

  const canSubmit = title.trim().length > 0 && !isExecuting

  function handleCreate() {
    execute({
      title: title.trim(),
      description: description.trim() || undefined,
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create notebook</DialogTitle>
          <DialogDescription>
            Start a new research workspace with your documents and AI chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <label htmlFor="notebook-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="notebook-title"
              placeholder="e.g. Q3 Market Research"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  e.preventDefault()
                  handleCreate()
                }
              }}
              aria-invalid={Boolean(titleError)}
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="notebook-desc" className="text-sm font-medium">
              Description
              <span className="ml-1 font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Textarea
              id="notebook-desc"
              placeholder="What will you explore in this notebook?"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {descriptionError && (
              <p className="text-xs text-destructive">{descriptionError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit}>
            {isExecuting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
