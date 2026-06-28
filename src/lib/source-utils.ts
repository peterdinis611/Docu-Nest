import type { DocumentType } from "@/types"

export function inferDocumentType(
  fileName: string,
  mimeType?: string | null
): DocumentType {
  const ext = fileName.split(".").pop()?.toLowerCase()

  if (ext === "pdf" || mimeType === "application/pdf") return "pdf"
  if (ext === "md" || ext === "txt" || mimeType?.startsWith("text/")) return "note"
  if (
    ext === "doc" ||
    ext === "docx" ||
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "article"
  }

  return "article"
}

export function titleFromFileName(fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, "").trim()
  return base.length > 0 ? base : fileName
}
