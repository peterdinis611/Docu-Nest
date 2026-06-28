import "server-only"

import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { generateStudioPayload } from "@/lib/studio/generate"
import { serializeStudioContent } from "@/lib/studio/content"
import type { StudioOutputType } from "@/types"
import type { SourceDocument } from "@/types"
import { buildNotebookContext } from "./context"
import { getChatModel, isAiEnabled } from "./models"

const briefingSchema = z.object({
  executiveSummary: z.string(),
  highlights: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      summary: z.string(),
      keyPoint: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
  coverageGaps: z.array(z.string()),
})

const briefingPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a research assistant that writes executive briefings.
Use ONLY the provided sources. Do not invent facts.
Return structured JSON for a briefing document.`,
  ],
  [
    "human",
    `Create a briefing for this notebook.

{context}

Return:
- executiveSummary: 2-3 sentences
- highlights: one item per source (use the exact source Id from context)
- recommendations: 3-4 actionable next steps
- coverageGaps: list limitations or missing coverage; empty array if coverage is strong`,
  ],
])

async function generateBriefingWithAi(
  sources: SourceDocument[],
  notebookTitle: string
) {
  const { contextText, sourceCount } = buildNotebookContext(notebookTitle, sources)
  const model = getChatModel().withStructuredOutput(briefingSchema)
  const chain = briefingPrompt.pipe(model)

  const result = await chain.invoke({ context: contextText })

  return {
    title: "Briefing Doc",
    content: serializeStudioContent({
      format: "briefing-doc",
      notebookTitle,
      generatedAt: new Date().toISOString(),
      executiveSummary: result.executiveSummary,
      sourceCount,
      highlights: result.highlights,
      recommendations: result.recommendations,
      coverageGaps: result.coverageGaps,
    }),
    duration: undefined,
  }
}

export async function generateStudioContent(
  type: StudioOutputType,
  sources: SourceDocument[],
  notebookTitle = "Notebook"
) {
  if (!isAiEnabled()) {
    return generateStudioPayload(type, sources, notebookTitle)
  }

  try {
    if (type === "briefing-doc") {
      return await generateBriefingWithAi(sources, notebookTitle)
    }

    // Other studio types still use rule-based generation for now.
    return generateStudioPayload(type, sources, notebookTitle)
  } catch (error) {
    console.error("[langchain] studio generation failed, using fallback:", error)
    return generateStudioPayload(type, sources, notebookTitle)
  }
}
