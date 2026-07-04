import { AudioOverviewView } from "@/components/notebook/studio/AudioOverviewView"
import { BriefingDocView } from "@/components/notebook/studio/BriefingDocView"
import { FaqView } from "@/components/notebook/studio/FaqView"
import { FlashcardsView } from "@/components/notebook/studio/FlashcardsView"
import { MarkdownStudioView } from "@/components/notebook/studio/MarkdownStudioView"
import { MindMapView } from "@/components/notebook/studio/MindMapView"
import { StudyGuideView } from "@/components/notebook/studio/StudyGuideView"
import { TimelineView } from "@/components/notebook/studio/TimelineView"
import type { StudioStructuredContent } from "@/lib/studio/types"

interface StudioContentViewProps {
  content: StudioStructuredContent
  variant?: "compact" | "expanded"
}

export function StudioContentView({
  content,
  variant = "expanded",
}: StudioContentViewProps) {
  switch (content.format) {
    case "briefing-doc":
      return <BriefingDocView briefing={content} />
    case "mind-map":
      return <MindMapView root={content.root} variant={variant} />
    case "timeline":
      return (
        <div className="mx-auto w-full max-w-3xl">
          <TimelineView events={content.events} />
        </div>
      )
    case "flashcards":
      return (
        <div className="mx-auto w-full max-w-lg">
          <FlashcardsView cards={content.cards} />
        </div>
      )
    case "study-guide":
      return (
        <StudyGuideView
          notebookTitle={content.notebookTitle}
          concepts={content.concepts}
          reviewQuestions={content.reviewQuestions}
        />
      )
    case "faq":
      return <FaqView items={content.items} />
    case "audio-overview":
      return (
        <AudioOverviewView
          notebookTitle={content.notebookTitle}
          duration={content.duration}
          summary={content.summary}
          segments={content.segments}
        />
      )
    case "markdown":
      return (
        <div className="mx-auto w-full max-w-3xl">
          <MarkdownStudioView content={content.body} />
        </div>
      )
    default:
      return null
  }
}
