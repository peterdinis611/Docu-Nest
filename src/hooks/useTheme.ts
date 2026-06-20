import { useSelector } from "@xstate/react"
import { themeActor } from "@/actors/themeActor"
import type { Theme } from "@/machines/themeMachine"

export type { Theme, ResolvedTheme } from "@/machines/themeMachine"

export function useTheme() {
  const theme = useSelector(themeActor, (s) => s.context.theme)
  const resolvedTheme = useSelector(themeActor, (s) => s.context.resolvedTheme)

  function setTheme(next: Theme) {
    themeActor.send({ type: "SET_THEME", theme: next })
  }

  return { theme, resolvedTheme, setTheme }
}
