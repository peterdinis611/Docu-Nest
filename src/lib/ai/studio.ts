import "server-only"

import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { generateStudioPayload, STUDIO_TITLES } from "@/lib/studio/generate"
import { serializeStudioContent } from "@/lib/studio/content"
import type { StudioOutputType } from "@/types"
import type { SourceDocument } from "@/types"
import { buildStudioRagContext } from "./rag"
import { getChatModel, isAiEnabled } from "./models"

const sourceOnlyRule =
  "Use ONLY the provided sources. Do not invent facts. Return structured JSON."

async function runStructuredChain<T extends Record<string, unknown>>(
  prompt: ChatPromptTemplate,
  schema: z.ZodType<T>,
  context: string
) {
  const model = getChatModel().withStructuredOutput(schema)
  return prompt.pipe(model).invoke({ context })
}

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

const studyGuideSchema = z.object({
  concepts: z.array(
    z.object({
      id: z.string(),
      term: z.string(),
      definition: z.string(),
      sourceTitle: z.string().optional(),
    })
  ),
  reviewQuestions: z.array(z.string()),
})

const faqSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      sourceTitle: z.string().optional(),
    })
  ),
})

const audioSchema = z.object({
  summary: z.string(),
  duration: z.string(),
  segments: z.array(
    z.object({
      id: z.string(),
      speaker: z.enum(["host-a", "host-b"]),
      text: z.string(),
    })
  ),
})

const timelineSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      title: z.string(),
      description: z.string(),
      sourceId: z.string().optional(),
      sourceTitle: z.string().optional(),
    })
  ),
})

const mindMapSchema = z.object({
  root: z.object({
    id: z.string(),
    label: z.string(),
    children: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          children: z
            .array(z.object({ id: z.string(), label: z.string() }))
            .optional(),
        })
      )
      .optional(),
  }),
})

const flashcardsSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string(),
      front: z.string(),
      back: z.string(),
      sourceId: z.string().optional(),
    })
  ),
})

const basePrompt = (instruction: string) =>
  ChatPromptTemplate.fromMessages([
    ["system", `You are a research assistant. ${sourceOnlyRule} ${instruction}`],
    ["human", "{context}"],
  ])

async function generateWithAi(
  type: StudioOutputType,
  sources: SourceDocument[],
  notebookTitle: string
) {
  const { contextText, sourceCount } = await buildStudioRagContext(
    notebookTitle,
    sources,
    type
  )

  switch (type) {
    case "briefing-doc": {
      const result = await runStructuredChain(
        basePrompt(
          "Write an executive briefing with summary, per-source highlights (use exact source Ids), recommendations, and coverage gaps."
        ),
        briefingSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
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
      }
    }
    case "study-guide": {
      const result = await runStructuredChain(
        basePrompt(
          "Create a study guide with key concepts (term + definition) and 4-6 review questions."
        ),
        studyGuideSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
        content: serializeStudioContent({
          format: "study-guide",
          notebookTitle,
          concepts: result.concepts,
          reviewQuestions: result.reviewQuestions,
        }),
      }
    }
    case "faq": {
      const result = await runStructuredChain(
        basePrompt("Create 6-10 FAQ items grounded in the sources."),
        faqSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
        content: serializeStudioContent({ format: "faq", items: result.items }),
      }
    }
    case "audio-overview": {
      const result = await runStructuredChain(
        basePrompt(
          "Create a podcast-style transcript with host-a and host-b alternating. Include duration like 8:42 and 8-16 segments."
        ),
        audioSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
        content: serializeStudioContent({
          format: "audio-overview",
          notebookTitle,
          duration: result.duration,
          summary: result.summary,
          segments: result.segments,
        }),
        duration: result.duration,
      }
    }
    case "timeline": {
      const result = await runStructuredChain(
        basePrompt("Create a chronological timeline of events from the sources."),
        timelineSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
        content: serializeStudioContent({
          format: "timeline",
          events: result.events,
        }),
      }
    }
    case "mind-map": {
      const result = await runStructuredChain(
        basePrompt(
          "Create a mind map with a root node (notebook title) and branches per source with concept children."
        ),
        mindMapSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
        content: serializeStudioContent({ format: "mind-map", root: result.root }),
      }
    }
    case "flashcards": {
      const result = await runStructuredChain(
        basePrompt("Create 8-16 flashcards for active recall from the sources."),
        flashcardsSchema,
        contextText
      )
      return {
        title: STUDIO_TITLES[type],
        content: serializeStudioContent({
          format: "flashcards",
          cards: result.cards,
        }),
      }
    }
    default:
      return generateStudioPayload(type, sources, notebookTitle)
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
    return await generateWithAi(type, sources, notebookTitle)
  } catch (error) {
    console.error("[langchain] studio generation failed, using fallback:", error)
    return generateStudioPayload(type, sources, notebookTitle)
  }
}
