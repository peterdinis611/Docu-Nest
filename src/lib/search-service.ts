import "server-only"

import { listNotebooksForUser, listSourcesForUser } from "@/db/queries"
import { createFuseIndex, searchFuse } from "@/lib/fuse"
import {
  globalSearchFuseOptions,
  pageSearchItems,
  type SearchItem,
} from "@/lib/search-index"

export function buildGlobalSearchIndexForUser(userId: string): SearchItem[] {
  const notebooks: SearchItem[] = listNotebooksForUser(userId).map((nb) => ({
    id: `notebook-${nb.id}`,
    kind: "notebook" as const,
    title: nb.title,
    subtitle: nb.description ?? `${nb.sourceCount} sources`,
    href: `/notebook/${nb.id}`,
    keywords: nb.tags ?? undefined,
  }))

  const documents: SearchItem[] = listSourcesForUser(userId).map((doc) => ({
    id: `document-${doc.id}`,
    kind: "document" as const,
    title: doc.title,
    subtitle: `${doc.notebookTitle} · ${doc.type}`,
    href: `/notebook/${doc.notebookId}`,
    keywords: [doc.type, doc.notebookTitle],
  }))

  return [...pageSearchItems, ...notebooks, ...documents]
}

export function searchGlobalIndex(
  userId: string,
  query: string,
  limit = 50
): SearchItem[] {
  const index = buildGlobalSearchIndexForUser(userId)
  const fuse = createFuseIndex(index, globalSearchFuseOptions)
  return searchFuse(fuse, query, index, limit)
}
