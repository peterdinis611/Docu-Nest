import type { AnalyticsData } from "@/types"

export const EMPTY_ANALYTICS: AnalyticsData = {
  metrics: [
    { label: "Questions asked", value: 0, change: 0 },
    { label: "Sources indexed", value: 0, change: 0 },
    { label: "Studio outputs", value: 0, change: 0 },
    { label: "Hours saved", value: 0, change: 0, unit: "h" },
  ],
  weeklyActivity: buildEmptyWeek(),
  topNotebooks: [],
  breakdown: {
    chatSessions: 0,
    avgChatsPerDay: 0,
    documentsAdded: 0,
    notebooksWithUploads: 0,
    studioGenerated: 0,
    audioOverviews: 0,
  },
  efficiency: {
    hoursSaved: 0,
    hoursSavedChange: 0,
    answerCount: 0,
  },
}

function buildEmptyWeek() {
  return getLast7DayBuckets().map((bucket) => ({
    day: bucket.label,
    chats: 0,
    uploads: 0,
    studio: 0,
  }))
}

function getLast7DayBuckets() {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const buckets: { key: string; label: string; start: number; end: number }[] =
    []

  for (let i = 6; i >= 0; i--) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - i)

    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    buckets.push({
      key: start.toISOString().slice(0, 10),
      label: labels[start.getDay()],
      start: start.getTime(),
      end: end.getTime(),
    })
  }

  return buckets
}

function inRange(iso: string, startMs: number, endMs: number) {
  const t = new Date(iso).getTime()
  return t >= startMs && t < endMs
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

const MINUTES_SAVED_PER_ANSWER = 4

export function buildAnalyticsData(input: {
  messages: { role: "user" | "assistant"; createdAt: string }[]
  sources: { uploadedAt: string; notebookId: string }[]
  studioOutputs: { createdAt: string; type: string }[]
  topNotebooks: { id: string; title: string; messageCount: number }[]
}): AnalyticsData {
  const now = Date.now()
  const weekStart = now - 7 * 24 * 60 * 60 * 1000
  const prevWeekStart = now - 14 * 24 * 60 * 60 * 1000

  const userMessages = input.messages.filter((m) => m.role === "user")
  const assistantMessages = input.messages.filter((m) => m.role === "assistant")

  const countInWeek = <T extends { createdAt?: string; uploadedAt?: string }>(
    items: T[],
    dateKey: "createdAt" | "uploadedAt",
    start: number,
    end: number
  ) =>
    items.filter((item) => {
      const iso = item[dateKey]
      return iso ? inRange(iso, start, end) : false
    }).length

  const questionsThisWeek = countInWeek(
    userMessages,
    "createdAt",
    weekStart,
    now
  )
  const questionsPrevWeek = countInWeek(
    userMessages,
    "createdAt",
    prevWeekStart,
    weekStart
  )

  const sourcesThisWeek = countInWeek(
    input.sources,
    "uploadedAt",
    weekStart,
    now
  )
  const sourcesPrevWeek = countInWeek(
    input.sources,
    "uploadedAt",
    prevWeekStart,
    weekStart
  )

  const studioThisWeek = countInWeek(
    input.studioOutputs,
    "createdAt",
    weekStart,
    now
  )
  const studioPrevWeek = countInWeek(
    input.studioOutputs,
    "createdAt",
    prevWeekStart,
    weekStart
  )

  const answersThisWeek = countInWeek(
    assistantMessages,
    "createdAt",
    weekStart,
    now
  )
  const answersPrevWeek = countInWeek(
    assistantMessages,
    "createdAt",
    prevWeekStart,
    weekStart
  )

  const hoursThisWeek = round1((answersThisWeek * MINUTES_SAVED_PER_ANSWER) / 60)
  const hoursPrevWeek = round1((answersPrevWeek * MINUTES_SAVED_PER_ANSWER) / 60)
  const hoursChange = round1(hoursThisWeek - hoursPrevWeek)

  const weeklyActivity = getLast7DayBuckets().map((bucket) => ({
    day: bucket.label,
    chats: userMessages.filter((m) =>
      inRange(m.createdAt, bucket.start, bucket.end)
    ).length,
    uploads: input.sources.filter((s) =>
      inRange(s.uploadedAt, bucket.start, bucket.end)
    ).length,
    studio: input.studioOutputs.filter((o) =>
      inRange(o.createdAt, bucket.start, bucket.end)
    ).length,
  }))

  const notebooksWithUploads = new Set(
    input.sources
      .filter((s) => inRange(s.uploadedAt, weekStart, now))
      .map((s) => s.notebookId)
  ).size

  const audioOverviews = input.studioOutputs.filter(
    (o) =>
      o.type === "audio-overview" &&
      inRange(o.createdAt, weekStart, now)
  ).length

  return {
    metrics: [
      {
        label: "Questions asked",
        value: questionsThisWeek,
        change: percentChange(questionsThisWeek, questionsPrevWeek),
      },
      {
        label: "Sources indexed",
        value: sourcesThisWeek,
        change: percentChange(sourcesThisWeek, sourcesPrevWeek),
      },
      {
        label: "Studio outputs",
        value: studioThisWeek,
        change: percentChange(studioThisWeek, studioPrevWeek),
      },
      {
        label: "Hours saved",
        value: hoursThisWeek,
        change: hoursChange,
        unit: "h",
      },
    ],
    weeklyActivity,
    topNotebooks: [...input.topNotebooks]
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 4),
    breakdown: {
      chatSessions: questionsThisWeek,
      avgChatsPerDay: round1(questionsThisWeek / 7),
      documentsAdded: sourcesThisWeek,
      notebooksWithUploads,
      studioGenerated: studioThisWeek,
      audioOverviews,
    },
    efficiency: {
      hoursSaved: hoursThisWeek,
      hoursSavedChange: hoursChange,
      answerCount: answersThisWeek,
    },
  }
}
