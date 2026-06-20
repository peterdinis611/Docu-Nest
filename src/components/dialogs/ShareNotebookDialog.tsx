import type { ReactNode } from "react"
import { useState } from "react"
import { Copy, Link2, Users } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface ShareNotebookDialogProps {
  notebookTitle?: string
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareNotebookDialog({
  notebookTitle = "Notebook",
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ShareNotebookDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const shareUrl = "https://docunest.app/share/nb-demo-abc123"

  const handleCopy = () => {
    void navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share notebook</DialogTitle>
          <DialogDescription>
            Invite others to view or collaborate on{" "}
            <span className="font-medium text-foreground">{notebookTitle}</span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Share link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  value={shareUrl}
                  className="pl-9 font-mono text-xs"
                />
              </div>
              <Button variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5">
                <Copy className="size-3.5" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Invite by email
            </label>
            <div className="flex gap-2">
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                className="flex-1"
              />
              <Button className="shrink-0 gap-1.5">
                <Users className="size-3.5" />
                Invite
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium">Access level</p>
            <div className="mt-2 flex gap-2">
              {["View only", "Can comment", "Can edit"].map((level, i) => (
                <button
                  key={level}
                  type="button"
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs transition-colors",
                    i === 0
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
