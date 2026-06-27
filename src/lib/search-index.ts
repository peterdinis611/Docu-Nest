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

export const pageSearchItems: SearchItem[] = [
  {
    id: "page-home",
    kind: "page",
    title: "Home",
    subtitle: "Dashboard and notebooks overview",
    href: "/app",
  },
  {
    id: "page-library",
    kind: "page",
    title: "Library",
    subtitle: "Browse all documents",
    href: "/app/library",
  },
  {
    id: "page-analytics",
    kind: "page",
    title: "Analytics",
    subtitle: "Usage insights",
    href: "/app/analytics",
  },
  {
    id: "page-settings",
    kind: "page",
    title: "Settings",
    subtitle: "Account and preferences",
    href: "/app/settings",
  },
]
