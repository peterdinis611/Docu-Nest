import { assign, setup } from "xstate"

export interface SearchContext {
  open: boolean
}

export type SearchEvent =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }

export const searchMachine = setup({
  types: {
    context: {} as SearchContext,
    events: {} as SearchEvent,
  },
  actions: {
    open:   assign({ open: () => true }),
    close:  assign({ open: () => false }),
    toggle: assign({ open: ({ context }) => !context.open }),
  },
}).createMachine({
  id: "search",
  initial: "idle",
  context: { open: false },
  states: {
    idle: {
      on: {
        OPEN:   { actions: "open" },
        CLOSE:  { actions: "close" },
        TOGGLE: { actions: "toggle" },
      },
    },
  },
})
