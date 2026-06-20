import type { ReactNode } from "react"
import { useState } from "react"
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
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="notebook-desc" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="notebook-desc"
              placeholder="What will you explore in this notebook?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
