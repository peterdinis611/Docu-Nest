import type { DocumentType, SourceDocument } from "@/types"

export const fileTypeLabels: Record<DocumentType, string> = {
  pdf: "PDF",
  article: "Article",
  note: "Note",
  webpage: "Webpage",
}

export function fileName(document: SourceDocument) {
  return document.originalName ?? document.title
}

export function isPdfFile(document: SourceDocument) {
  const name = fileName(document)
  return (
    document.type === "pdf" ||
    document.mimeType === "application/pdf" ||
    name.toLowerCase().endsWith(".pdf")
  )
}

export function isTextFile(document: SourceDocument) {
  const name = fileName(document)
  const ext = name.split(".").pop()?.toLowerCase()
  return (
    document.type === "note" ||
    document.mimeType?.startsWith("text/") ||
    ext === "txt" ||
    ext === "md"
  )
}

export function isMarkdownFile(document: SourceDocument) {
  const name = fileName(document)
  return (
    document.mimeType === "text/markdown" ||
    name.toLowerCase().endsWith(".md")
  )
}

export function isImageFile(document: SourceDocument) {
  const name = fileName(document)
  return (
    document.mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(name)
  )
}

export type FilePreviewMode = "pdf" | "text" | "image" | "unsupported" | "none"

export function getFilePreviewMode(document: SourceDocument): FilePreviewMode {
  if (!document.fileUrl) return "none"
  if (isPdfFile(document)) return "pdf"
  if (isImageFile(document)) return "image"
  if (isTextFile(document)) return "text"
  return "unsupported"
}
