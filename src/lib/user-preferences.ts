export interface SettingsSummary {
  ai: {
    enabled: boolean
    chatModel: string
    embeddingModel: string
  }
  usage: {
    notebookCount: number
    sourceCount: number
    messageCount: number
  }
}

export const EMPTY_SETTINGS_SUMMARY: SettingsSummary = {
  ai: {
    enabled: false,
    chatModel: "gpt-4o-mini",
    embeddingModel: "text-embedding-3-small",
  },
  usage: {
    notebookCount: 0,
    sourceCount: 0,
    messageCount: 0,
  },
}

export type SettingsSection = "profile" | "data"
