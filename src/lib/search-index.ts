import { mockAllDocuments, mockNotebooks } from "@/data/mock"

export type SearchItemKind = "notebook" | "document" | "page"

export interface SearchItem {
  id: string
  kind: SearchItemKind
  title: string
  subtitle: string
  href: string
  keywords?: string[]
}

export const libraryDocumentSearchKeys = [
  "title",
  "description",
  "notebookTitle",
  "type",
] as const

export const libraryDocumentFuseOptions = {
  keys: [...libraryDocumentSearchKeys],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

export const globalSearchFuseOptions = {
  keys: ["title", "subtitle", "keywords"],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
}

const pageItems: SearchItem[] = [
  {
    id: "page-home",
    kind: "page",
    title: "Home",
    subtitle: "Dashboard and notebooks overview",
    href: "/",
  },
  {
    id: "page-library",
    kind: "page",
    title: "Library",
    subtitle: "Browse all documents",
    href: "/library",
  },
  {
    id: "page-analytics",
    kind: "page",
    title: "Analytics",
    subtitle: "Usage insights",
    href: "/analytics",
  },
  {
    id: "page-settings",
    kind: "page",
    title: "Settings",
    subtitle: "Account and preferences",
    href: "/settings",
  },
]

export function buildGlobalSearchIndex(): SearchItem[] {
  const notebooks: SearchItem[] = mockNotebooks.map((nb) => ({
    id: `notebook-${nb.id}`,
    kind: "notebook",
    title: nb.title,
    subtitle: nb.description ?? `${nb.sourceCount} sources`,
    href: `/notebook/${nb.id}`,
    keywords: nb.tags,
  }))

  const documents: SearchItem[] = mockAllDocuments.map((doc) => ({
    id: `document-${doc.id}`,
    kind: "document",
    title: doc.title,
    subtitle: `${doc.notebookTitle} · ${doc.type}`,
    href: `/notebook/${doc.notebookId}`,
    keywords: [doc.type, doc.notebookTitle],
  }))

  return [...pageItems, ...notebooks, ...documents]
}
