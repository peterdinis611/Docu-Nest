import "server-only"

import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import mammoth from "mammoth"
import { extractText, getDocumentProxy } from "unpdf"

const MAX_EXTRACTED_CHARS = 500_000

export interface ExtractionResult {
  text: string
  title?: string
  pageCount?: number
}

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

function truncate(text: string) {
  if (text.length <= MAX_EXTRACTED_CHARS) return text
  return `${text.slice(0, MAX_EXTRACTED_CHARS)}\n\n[Truncated]`
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<ExtractionResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text, totalPages } = await extractText(pdf, { mergePages: true })
  const normalized = normalizeText(text)

  return {
    text: truncate(normalized),
    pageCount: totalPages,
  }
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
  return {
    text: truncate(normalizeText(result.value)),
  }
}

export async function extractPlainText(buffer: ArrayBuffer): Promise<ExtractionResult> {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer)
  return {
    text: truncate(normalizeText(text)),
  }
}

export async function extractUrlText(url: string): Promise<ExtractionResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "DocuNest/1.0 (+https://docunest.app; research notebook importer)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    throw new Error(`Could not fetch URL (${response.status})`)
  }

  const html = await response.text()
  const dom = new JSDOM(html, { url })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()

  if (!article?.textContent?.trim()) {
    throw new Error("No readable article content found at this URL")
  }

  return {
    text: truncate(normalizeText(article.textContent)),
    title: article.title?.trim() || undefined,
  }
}

export async function extractFromBuffer(
  buffer: ArrayBuffer,
  input: {
    mimeType?: string | null
    fileName?: string
  }
): Promise<ExtractionResult> {
  const name = input.fileName?.toLowerCase() ?? ""
  const mime = input.mimeType?.toLowerCase() ?? ""

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdfText(buffer)
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword" ||
    name.endsWith(".docx") ||
    name.endsWith(".doc")
  ) {
    return extractDocxText(buffer)
  }

  return extractPlainText(buffer)
}

export async function extractFromFileUrl(
  fileUrl: string,
  input: {
    mimeType?: string | null
    fileName?: string
  }
): Promise<ExtractionResult> {
  const response = await fetch(fileUrl, { signal: AbortSignal.timeout(30_000) })

  if (!response.ok) {
    throw new Error(`Could not download file (${response.status})`)
  }

  const buffer = await response.arrayBuffer()
  return extractFromBuffer(buffer, input)
}

export function excerptFromText(text: string, max = 160) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}
