import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import {
  createStudioOutput,
  mockAllDocuments,
  mockDocuments,
  mockNotebooks,
  mockSavedNotes,
} from "@/data/mock"
import type { ChatMessage } from "@/types"
import * as schema from "./schema"

const seedMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "What is the core contribution of the Transformer paper?",
    createdAt: "2026-06-14T09:00:00Z",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      'The Transformer proposes an architecture based solely on attention mechanisms, dispensing with recurrence and convolutions.\n\n[Source: Attention Is All You Need, Introduction]',
    citations: [
      { documentId: "doc-1", documentTitle: "Attention Is All You Need" },
    ],
    createdAt: "2026-06-14T09:00:15Z",
  },
]

const url = process.env.DATABASE_URL ?? "file:./data/sqlite.db"
const path = url.startsWith("file:") ? url.slice(5) : url

const sqlite = new Database(path)
sqlite.pragma("foreign_keys = ON")

const db = drizzle(sqlite, { schema })

migrate(db, { migrationsFolder: "./drizzle" })

const seedUserId = process.env.SEED_USER_ID ?? "user_seed"

db.delete(schema.studioOutputs).run()
db.delete(schema.savedNotes).run()
db.delete(schema.messages).run()
db.delete(schema.sources).run()
db.delete(schema.notebooks).run()

for (const notebook of mockNotebooks) {
  db.insert(schema.notebooks)
    .values({
      id: notebook.id,
      userId: seedUserId,
      title: notebook.title,
      description: notebook.description,
      color: notebook.color,
      tags: notebook.tags,
      updatedAt: notebook.updatedAt,
    })
    .run()
}

for (const source of mockAllDocuments) {
  db.insert(schema.sources)
    .values({
      id: source.id,
      notebookId: source.notebookId,
      title: source.title,
      type: source.type,
      description: source.description,
      pageCount: source.pageCount,
      enabled: source.enabled,
      uploadedAt: source.uploadedAt,
    })
    .run()
}

for (const message of seedMessages) {
  db.insert(schema.messages)
    .values({
      id: message.id,
      notebookId: "nb-1",
      role: message.role,
      content: message.content,
      citations: message.citations,
      createdAt: message.createdAt,
    })
    .run()
}

for (const note of mockSavedNotes) {
  db.insert(schema.savedNotes)
    .values({
      id: note.id,
      notebookId: "nb-1",
      title: note.title,
      excerpt: note.excerpt,
      body: note.excerpt,
      createdAt: note.createdAt,
    })
    .run()
}

for (const type of [
  "audio-overview",
  "study-guide",
  "briefing-doc",
] as const) {
  const output = createStudioOutput(type)
  db.insert(schema.studioOutputs)
    .values({
      id: output.id,
      notebookId: "nb-1",
      type: output.type,
      title: output.title,
      content: output.content,
      status: output.status,
      duration: output.duration,
      createdAt: output.createdAt,
    })
    .run()
}

console.log(
  `Seeded ${mockNotebooks.length} notebooks, ${mockAllDocuments.length} sources, ${mockDocuments.length} docs in nb-1 at ${path}`
)
sqlite.close()
