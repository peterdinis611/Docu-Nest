import "server-only"

import { ChatOpenAI } from "@langchain/openai"
import { OpenAIEmbeddings } from "@langchain/openai"

export function isAiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY)
}

export function getChatModel() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.2,
  })
}

export function getEmbeddings() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  return new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  })
}
