"use client"

import { FileViewer } from "@/components/notebook/FileViewer"
import type { SourceDocument } from "@/types"

interface DocumentPreviewProps {
  document: SourceDocument
  documents?: SourceDocument[]
  onClose: () => void
  onSelectDocument?: (id: string) => void
}

export function DocumentPreview({
  document,
  documents,
  onClose,
  onSelectDocument,
}: DocumentPreviewProps) {
  return (
    <FileViewer
      document={document}
      documents={documents}
      onClose={onClose}
      onSelectDocument={onSelectDocument}
    />
  )
}
