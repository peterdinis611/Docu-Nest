import "server-only"

import {
  listLibraryDocumentsForUser,
  listNotebooksForUser,
} from "@/db/queries"
import { isAiEnabled } from "@/lib/ai/models"
import type { SettingsSummary } from "@/lib/user-preferences"

export function getSettingsSummaryForUser(userId: string): SettingsSummary {
  const notebooks = listNotebooksForUser(userId)
  const documents = listLibraryDocumentsForUser(userId)

  return {
    ai: {
      enabled: isAiEnabled(),
      chatModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      embeddingModel:
        process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    },
    usage: {
      notebookCount: notebooks.length,
      sourceCount: documents.length,
      messageCount: notebooks.reduce(
        (total, notebook) => total + (notebook.messageCount ?? 0),
        0
      ),
    },
  }
}
