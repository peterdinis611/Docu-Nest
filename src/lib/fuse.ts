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
