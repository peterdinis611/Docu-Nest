"use client"

import { useState } from "react"
import {
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import {
  deleteSourceAction,
  toggleSourceEnabledAction,
} from "@/actions/sources"
import { EditSourceDialog } from "@/components/dialogs/EditSourceDialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SourceDocument } from "@/types"

interface SourceActionsMenuProps {
  notebookId: string
  source: SourceDocument
  onUpdated?: (source: SourceDocument) => void
  onDeleted?: (sourceId: string) => void
  align?: "start" | "end"
}

export function SourceActionsMenu({
  notebookId,
  source,
  onUpdated,
  onDeleted,
  align = "end",
}: SourceActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { execute: toggleEnabled, isExecuting: isToggling } = useAction(
    toggleSourceEnabledAction,
    {
      onSuccess: ({ data }) => {
        onUpdated?.(data.source)
        toast.success(data.source.enabled ? "Source enabled" : "Source disabled")
      },
      onError: () => toast.error("Could not update source status"),
    }
  )

  const { execute: deleteSource, isExecuting: isDeleting } = useAction(
    deleteSourceAction,
    {
      onSuccess: () => {
        onDeleted?.(source.id)
        toast.success("Source deleted")
        setDeleteOpen(false)
      },
      onError: () => toast.error("Could not delete source"),
    }
  )

  const busy = isToggling || isDeleting

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            disabled={busy}
            aria-label={`Actions for ${source.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <MoreHorizontal className="size-3.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-44">
          <DropdownMenuItem
            className="gap-2"
            onClick={(event) => {
              event.stopPropagation()
              setEditOpen(true)
            }}
          >
            <Pencil className="size-3.5" />
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={(event) => {
              event.stopPropagation()
              toggleEnabled({
                notebookId,
                sourceId: source.id,
                enabled: !source.enabled,
              })
            }}
          >
            {source.enabled ? (
              <>
                <EyeOff className="size-3.5" />
                Disable in chat
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                Enable in chat
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={(event) => {
              event.stopPropagation()
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditSourceDialog
        notebookId={notebookId}
        source={source}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onUpdated}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent onClick={(event) => event.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete source?</DialogTitle>
            <DialogDescription>
              &ldquo;{source.title}&rdquo; will be removed from this notebook.
              Chat history will remain, but this file will no longer be available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() =>
                deleteSource({ notebookId, sourceId: source.id })
              }
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete source"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
