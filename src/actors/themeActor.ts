import { createActor } from "xstate"
import { themeMachine } from "@/machines/themeMachine"

/**
 * Singleton theme actor — started once at module load time.
 * Components subscribe via useSelector, no Provider needed.
 */
export const themeActor = createActor(themeMachine)

if (typeof window !== "undefined") {
  themeActor.start()
}
