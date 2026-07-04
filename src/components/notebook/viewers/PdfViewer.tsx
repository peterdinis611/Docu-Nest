"use client"

import { PDFViewer } from "@embedpdf/react-pdf-viewer"

interface PdfViewerProps {
  src: string
  title: string
}

export function PdfViewer({ src, title }: PdfViewerProps) {
  return (
    <div
      className="mx-auto h-[min(78vh,900px)] w-full max-w-5xl overflow-hidden rounded-lg border bg-background shadow-sm"
      aria-label={`PDF preview: ${title}`}
    >
      <PDFViewer
        config={{
          src,
          theme: { preference: "system" },
          tabBar: "never",
          disabledCategories: [
            "annotation",
            "redaction",
            "form",
            "insert",
            "print",
            "export",
          ],
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
