"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { useAction } from "next-safe-action/hooks"
import { Database, Loader2, LogOut, Shield, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteAllNotebooksAction } from "@/actions/notebooks"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SettingsSummary } from "@/lib/user-preferences"

interface DataSectionProps {
  summary: SettingsSummary
}

export function DataSection({ summary }: DataSectionProps) {
  const router = useRouter()
  const { signOut } = useClerk()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { execute: deleteAll, isExecuting } = useAction(deleteAllNotebooksAction, {
    onSuccess: ({ data }) => {
      toast.success("All notebooks deleted", {
        description: `${data.deletedCount} notebook${data.deletedCount === 1 ? "" : "s"} removed.`,
      })
      setDeleteOpen(false)
      router.push("/app")
      router.refresh()
    },
    onError: () => toast.error("Could not delete notebooks"),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4" />
            Your data
          </CardTitle>
          <CardDescription>
            Usage stored in your DocuNest workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/20 px-4 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {summary.usage.notebookCount}
              </p>
              <p className="text-xs text-muted-foreground">Notebooks</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-4 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {summary.usage.sourceCount}
              </p>
              <p className="text-xs text-muted-foreground">Sources</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-4 py-3">
              <p className="text-2xl font-semibold tabular-nums">
                {summary.usage.messageCount}
              </p>
              <p className="text-xs text-muted-foreground">Chat messages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>Sign out of DocuNest on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2" onClick={() => signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Shield className="size-4" />
            Danger zone
          </CardTitle>
          <CardDescription>
            Destructive actions that cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Delete all notebooks</p>
            <p className="text-xs text-muted-foreground">
              Permanently removes {summary.usage.notebookCount} notebook
              {summary.usage.notebookCount === 1 ? "" : "s"}, all sources, chat
              history, and studio outputs.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={summary.usage.notebookCount === 0}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            Delete all
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all notebooks?</DialogTitle>
            <DialogDescription>
              This permanently deletes every notebook, source, message, and
              studio output in your account. Your Clerk profile is not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isExecuting}
              onClick={() => deleteAll({ confirm: true })}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete everything"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
