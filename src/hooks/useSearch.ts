import { useEffect } from "react"
import { useSelector } from "@xstate/react"
import { searchActor } from "@/actors/searchActor"

export function useSearch() {
  const open = useSelector(searchActor, (s) => s.context.open)

  function openSearch() {
    searchActor.send({ type: "OPEN" })
  }

  function closeSearch() {
    searchActor.send({ type: "CLOSE" })
  }

  return { open, openSearch, closeSearch }
}

/**
 * Register ⌘K / Ctrl+K global shortcut.
 * Call once at the top of the component tree.
 */
export function useSearchShortcut() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchActor.send({ type: "OPEN" })
      }
      if (e.key === "Escape") {
        searchActor.send({ type: "CLOSE" })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
}
