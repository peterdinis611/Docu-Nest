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

export type FilePreviewMode =
  | "pdf"
  | "markdown"
  | "text"
  | "image"
  | "unsupported"
  | "none"

export function getFilePreviewMode(document: SourceDocument): FilePreviewMode {
  if (!document.fileUrl) return "none"
  if (isPdfFile(document)) return "pdf"
  if (isImageFile(document)) return "image"
  if (isMarkdownFile(document)) return "markdown"
  if (isTextFile(document)) return "text"
  return "unsupported"
}

export function getSyntaxLanguage(document: SourceDocument) {
  const ext = fileName(document).split(".").pop()?.toLowerCase()

  switch (ext) {
    case "json":
      return "json"
    case "js":
    case "jsx":
      return "javascript"
    case "ts":
    case "tsx":
      return "typescript"
    case "html":
    case "htm":
      return "html"
    case "css":
      return "css"
    case "py":
      return "python"
    case "md":
      return "markdown"
    case "yaml":
    case "yml":
      return "yaml"
    case "xml":
      return "xml"
    case "sql":
      return "sql"
    default:
      return "text"
  }
}

export function hasBuiltInZoom(mode: FilePreviewMode) {
  return mode === "markdown" || mode === "text"
}
