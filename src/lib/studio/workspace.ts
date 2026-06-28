import type { StudioOutput, StudioOutputType } from "@/types"

export const MAIN_WORKSPACE_STUDIO_TYPES = [
  "mind-map",
  "briefing-doc",
] as const satisfies readonly StudioOutputType[]

export type MainWorkspaceStudioType = (typeof MAIN_WORKSPACE_STUDIO_TYPES)[number]

export function opensInMainWorkspace(
  type: StudioOutputType
): type is MainWorkspaceStudioType {
  return (MAIN_WORKSPACE_STUDIO_TYPES as readonly string[]).includes(type)
}

export function isMainWorkspaceStudioOutput(
  output?: StudioOutput
): output is StudioOutput & { type: MainWorkspaceStudioType } {
  return output != null && opensInMainWorkspace(output.type)
}

export const MAIN_WORKSPACE_LABELS: Record<MainWorkspaceStudioType, string> = {
  "mind-map": "Mind map",
  "briefing-doc": "Briefing doc",
}
