import type { ReactNode } from "react"
import { useState } from "react"
import { FileText, Globe, Link2, Upload } from "lucide-react"
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

type SourceType = "upload" | "url" | "paste"

interface AddSourceDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddSourceDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AddSourceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [sourceType, setSourceType] = useState<SourceType>("upload")
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <Upload className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drop files here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, TXT, MD — up to 50 MB
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Browse files
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
              />
            </div>
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
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Add source</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
