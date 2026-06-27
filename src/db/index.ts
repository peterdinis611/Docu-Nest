import "server-only"

import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"

function resolveDatabasePath() {
  const url = process.env.DATABASE_URL ?? "file:./data/sqlite.db"
  return url.startsWith("file:") ? url.slice(5) : url
}

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined
}

function createClient() {
  const client = new Database(resolveDatabasePath())
  client.pragma("journal_mode = WAL")
  client.pragma("foreign_keys = ON")
  return client
}

const sqlite = globalForDb.sqlite ?? createClient()

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite
}

export const db = drizzle(sqlite, { schema })
export { schema }
