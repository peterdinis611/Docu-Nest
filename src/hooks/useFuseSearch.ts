import { useMemo } from "react"
import Fuse, { type IFuseOptions } from "fuse.js"

export function createFuseIndex<T>(
  items: readonly T[],
  options: IFuseOptions<T>
) {
  return new Fuse([...items], { includeScore: true, ...options })
}

export function searchFuse<T>(
  fuse: Fuse<T>,
  query: string,
  items: readonly T[],
  limit?: number
): T[] {
  const trimmed = query.trim()
  if (!trimmed) return [...items]

  const results = fuse.search(trimmed, limit ? { limit } : undefined)
  return results.map((result) => result.item)
}

export function useFuseSearch<T>(
  items: readonly T[],
  query: string,
  options: IFuseOptions<T>
) {
  const fuse = useMemo(
    () => createFuseIndex(items, options),
    [items, options]
  )

  return useMemo(
    () => searchFuse(fuse, query, items),
    [fuse, query, items]
  )
}
