export const cacheTags = {
  userNotebooks: (userId: string) => `notebooks:${userId}`,
  userNotebook: (userId: string, notebookId: string) =>
    `notebook:${userId}:${notebookId}`,
  userAnalytics: (userId: string) => `analytics:${userId}`,
} as const
