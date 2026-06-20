import { createActor } from "xstate"
import { searchMachine } from "@/machines/searchMachine"

/**
 * Singleton search actor — started once at module load time.
 * Components subscribe via useSelector, no Provider needed.
 */
export const searchActor = createActor(searchMachine)
searchActor.start()
