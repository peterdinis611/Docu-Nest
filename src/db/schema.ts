import { relations, sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const notebooks = sqliteTable("notebooks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  color: text("color")
    .notNull()
    .default("from-blue-500/20 to-indigo-500/10"),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  notebookId: text("notebook_id")
    .notNull()
    .references(() => notebooks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type", {
    enum: ["pdf", "article", "note", "webpage"],
  }).notNull(),
  description: text("description").notNull().default(""),
  pageCount: integer("page_count"),
  fileKey: text("file_key"),
  fileUrl: text("file_url"),
  sourceUrl: text("source_url"),
  mimeType: text("mime_type"),
  originalName: text("original_name"),
  fileSize: integer("file_size"),
  extractedText: text("extracted_text"),
  indexStatus: text("index_status", {
    enum: ["pending", "ready", "failed"],
  })
    .notNull()
    .default("pending"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  uploadedAt: text("uploaded_at")
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const sourceChunks = sqliteTable("source_chunks", {
  id: text("id").primaryKey(),
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  embedding: text("embedding", { mode: "json" }).$type<number[]>(),
  sourceTitle: text("source_title").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  notebookId: text("notebook_id")
    .notNull()
    .references(() => notebooks.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  mode: text("mode", {
    enum: ["qa", "summary", "deep-dive", "comparison", "quiz", "outline", "audio"],
  }),
  content: text("content").notNull(),
  citations: text("citations", { mode: "json" }).$type<
    Array<{
      documentId: string
      documentTitle: string
      section?: string
    }>
  >(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const savedNotes = sqliteTable("saved_notes", {
  id: text("id").primaryKey(),
  notebookId: text("notebook_id")
    .notNull()
    .references(() => notebooks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const studioOutputs = sqliteTable("studio_outputs", {
  id: text("id").primaryKey(),
  notebookId: text("notebook_id")
    .notNull()
    .references(() => notebooks.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "audio-overview",
      "study-guide",
      "briefing-doc",
      "faq",
      "timeline",
      "mind-map",
      "flashcards",
    ],
  }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  status: text("status", { enum: ["idle", "generating", "ready"] })
    .notNull()
    .default("idle"),
  duration: text("duration"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const notebooksRelations = relations(notebooks, ({ many }) => ({
  sources: many(sources),
  messages: many(messages),
  savedNotes: many(savedNotes),
  studioOutputs: many(studioOutputs),
}))

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  notebook: one(notebooks, {
    fields: [sources.notebookId],
    references: [notebooks.id],
  }),
  chunks: many(sourceChunks),
}))

export const sourceChunksRelations = relations(sourceChunks, ({ one }) => ({
  source: one(sources, {
    fields: [sourceChunks.sourceId],
    references: [sources.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  notebook: one(notebooks, {
    fields: [messages.notebookId],
    references: [notebooks.id],
  }),
}))

export const savedNotesRelations = relations(savedNotes, ({ one }) => ({
  notebook: one(notebooks, {
    fields: [savedNotes.notebookId],
    references: [notebooks.id],
  }),
}))

export const studioOutputsRelations = relations(studioOutputs, ({ one }) => ({
  notebook: one(notebooks, {
    fields: [studioOutputs.notebookId],
    references: [notebooks.id],
  }),
}))

export type NotebookRow = typeof notebooks.$inferSelect
export type SourceRow = typeof sources.$inferSelect
export type SourceChunkRow = typeof sourceChunks.$inferSelect
export type MessageRow = typeof messages.$inferSelect
export type SavedNoteRow = typeof savedNotes.$inferSelect
export type StudioOutputRow = typeof studioOutputs.$inferSelect
export type IndexStatus = "pending" | "ready" | "failed"
