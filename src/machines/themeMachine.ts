import { assign, fromCallback, setup } from "xstate"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "docunest-theme"

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system")
    return stored
  return "system"
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyToDom(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

const initialTheme = getStoredTheme()
const initialResolved = resolve(initialTheme)

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
      localStorage.setItem(STORAGE_KEY, context.theme)
    },
    applyDom: ({ context }) => {
      applyToDom(context.resolvedTheme)
    },
  },
}).createMachine({
  id: "theme",
  initial: initialTheme === "system" ? "watchingSystem" : "fixed",
  context: {
    theme: initialTheme,
    resolvedTheme: initialResolved,
  },

  states: {
    fixed: {
      on: {
        SET_THEME: [
          {
            guard: ({ event }) => event.theme === "system",
            target: "watchingSystem",
            actions: assign(({ event }) => ({
              theme: event.theme,
              resolvedTheme: resolve(event.theme),
            })),
          },
          {
            target: "fixed",
            actions: assign(({ event }) => ({
              theme: event.theme,
              resolvedTheme: resolve(event.theme),
            })),
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
            actions: assign(({ event }) => ({
              theme: event.theme,
              resolvedTheme: resolve(event.theme),
            })),
          },
          {
            target: "watchingSystem",
            actions: assign(({ event }) => ({
              theme: event.theme,
              resolvedTheme: resolve(event.theme),
            })),
          },
        ],
        SYSTEM_CHANGED: {
          actions: assign(({ context }) => ({
            resolvedTheme: getSystemTheme(),
            theme: context.theme,
          })),
        },
      },
      entry: ["persist", "applyDom"],
    },
  },
})
