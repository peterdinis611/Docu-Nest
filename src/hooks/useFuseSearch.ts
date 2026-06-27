import { useMemo } from "react"
import { createFuseIndex, searchFuse } from "@/lib/fuse"
import type { IFuseOptions } from "fuse.js"

export { createFuseIndex, searchFuse } from "@/lib/fuse"

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
