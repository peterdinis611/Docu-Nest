import { assign, fromCallback, setup } from "xstate"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "docunest-theme"

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyToDom(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

export interface ThemeContext {
  theme: Theme
  resolvedTheme: ResolvedTheme
}

export type ThemeEvent =
  | { type: "SET_THEME"; theme: Theme }
  | { type: "SYSTEM_CHANGED" }

/**
 * Actor that watches prefers-color-scheme and sends SYSTEM_CHANGED
 * whenever it fires (only used in state "watchingSystem").
 */
const systemWatcher = fromCallback<{ type: "SYSTEM_CHANGED" }>(({ sendBack }) => {
  if (typeof window === "undefined") return () => {}
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => sendBack({ type: "SYSTEM_CHANGED" })
  media.addEventListener("change", handler)
  return () => media.removeEventListener("change", handler)
})

export const themeMachine = setup({
  types: {
    context: {} as ThemeContext,
    events: {} as ThemeEvent,
  },
  actors: { systemWatcher },
  actions: {
    persist: ({ context }) => {
      if (typeof window === "undefined") return
      localStorage.setItem(STORAGE_KEY, context.theme)
    },
    applyDom: ({ context }) => {
      applyToDom(context.resolvedTheme)
    },
  },
}).createMachine({
  id: "theme",
  initial: "watchingSystem",
  context: {
    theme: "system",
    resolvedTheme: "light",
  },

  states: {
    fixed: {
      on: {
        SET_THEME: [
          {
            guard: ({ event }) => event.theme === "system",
            target: "watchingSystem",
            actions: [
              assign(({ event }) => ({
                theme: event.theme,
                resolvedTheme: resolve(event.theme),
              })),
              "persist",
              "applyDom",
            ],
          },
          {
            target: "fixed",
            actions: [
              assign(({ event }) => ({
                theme: event.theme,
                resolvedTheme: resolve(event.theme),
              })),
              "persist",
              "applyDom",
            ],
          },
        ],
      },
      entry: ["persist", "applyDom"],
    },

    watchingSystem: {
      invoke: { src: "systemWatcher" },
      on: {
        SET_THEME: [
          {
            guard: ({ event }) => event.theme !== "system",
            target: "fixed",
            actions: [
              assign(({ event }) => ({
                theme: event.theme,
                resolvedTheme: resolve(event.theme),
              })),
              "persist",
              "applyDom",
            ],
          },
          {
            target: "watchingSystem",
            actions: [
              assign(({ event }) => ({
                theme: event.theme,
                resolvedTheme: resolve(event.theme),
              })),
              "persist",
              "applyDom",
            ],
          },
        ],
        SYSTEM_CHANGED: {
          actions: [
            assign(({ context }) => ({
              resolvedTheme: getSystemTheme(),
              theme: context.theme,
            })),
            "applyDom",
          ],
        },
      },
      entry: ["persist", "applyDom"],
    },
  },
})
