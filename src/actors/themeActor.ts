import { createActor } from "xstate"
import { themeMachine, type Theme } from "@/machines/themeMachine"

const STORAGE_KEY = "docunest-theme"

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored
  }
  return "system"
}

/**
 * Singleton theme actor — started once at module load time.
 * Components subscribe via useSelector, no Provider needed.
 */
export const themeActor = createActor(themeMachine)

if (typeof window !== "undefined") {
  themeActor.start()
  themeActor.send({ type: "SET_THEME", theme: getStoredTheme() })
}
