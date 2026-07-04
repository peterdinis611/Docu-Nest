import type { StudioOutputType } from "@/types"
import { STUDIO_TEMPLATES } from "@/types"

export const MAIN_WORKSPACE_STUDIO_TYPES = STUDIO_TEMPLATES.map(
  (template) => template.type
) as StudioOutputType[]

export type MainWorkspaceStudioType = StudioOutputType

export function opensInMainWorkspace(_type: StudioOutputType): _type is StudioOutputType {
  return true
}

export function isMainWorkspaceStudioOutput(
  output?: { type: StudioOutputType }
): output is { type: StudioOutputType } {
  return output != null
}

export const MAIN_WORKSPACE_LABELS = Object.fromEntries(
  STUDIO_TEMPLATES.map((template) => [template.type, template.description])
) as Record<StudioOutputType, string>
