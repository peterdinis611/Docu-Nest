"use client"

import { FileViewer } from "@/components/notebook/FileViewer"
import type { SourceDocument } from "@/types"

interface DocumentPreviewProps {
  document: SourceDocument
  documents?: SourceDocument[]
  notebookId?: string
  onClose: () => void
  onSelectDocument?: (id: string) => void
  onFocusChatDocument?: (id: string) => void
  onSourceUpdated?: (source: SourceDocument) => void
  onSourceDeleted?: (sourceId: string) => void
}

export function DocumentPreview({
  document,
  documents,
  notebookId,
  onClose,
  onSelectDocument,
  onFocusChatDocument,
  onSourceUpdated,
  onSourceDeleted,
}: DocumentPreviewProps) {
  return (
    <FileViewer
      document={document}
      documents={documents}
      notebookId={notebookId}
      onClose={onClose}
      onSelectDocument={onSelectDocument}
      onFocusChatDocument={onFocusChatDocument}
      onSourceUpdated={onSourceUpdated}
      onSourceDeleted={onSourceDeleted}
    />
  )
}
