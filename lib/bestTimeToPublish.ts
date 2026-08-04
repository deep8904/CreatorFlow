import type { ChannelVideo } from '@/lib/supabase/types'

/**
 * Best-Time-to-Publish analysis — day-of-week and time-of-day patterns
 * computed from the account's own `channel_videos` (real `published_at` +
 * current `views`), never a market benchmark. Two honesty gates, not one:
 *
 * 1. Account-level: below MIN_VIDEOS_FOR_ANALYSIS total videos, decline to
 *    analyze at all rather than pattern-match on noise.
 * 2. Per-bucket: even past that gate, a "best day" or "best daypart" only
 *    gets named if its own winning bucket has at least
 *    MIN_VIDEOS_PER_BUCKET videos — otherwise a single lucky upload could
 *    crown itself "your best day," which is a fabricated-confidence
 *    recommendation with extra steps.
 *
 * `channel_videos` caps at the 15 most recent uploads (see
 * supabase/functions/fetch-youtube-data/index.ts) and has no per-video
 * time-series — this reads current view totals grouped by publish
 * day/hour, a real but coarse proxy, not true "performance over time
 * since publish" data.
 */

export const MIN_VIDEOS_FOR_ANALYSIS = 10
export const MIN_VIDEOS_PER_BUCKET = 2

const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

type Daypart = 'Night (12–5am)' | 'Morning (5–11am)' | 'Afternoon (12–4pm)' | 'Evening (5–9pm)' | 'Late night (9pm–12am)'

function daypartFor(hour: number): Daypart {
  if (hour < 5) return 'Night (12–5am)'
  if (hour < 12) return 'Morning (5–11am)'
  if (hour < 17) return 'Afternoon (12–4pm)'
  if (hour < 21) return 'Evening (5–9pm)'
  return 'Late night (9pm–12am)'
}

const DAYPART_ORDER: Daypart[] = ['Morning (5–11am)', 'Afternoon (12–4pm)', 'Evening (5–9pm)', 'Late night (9pm–12am)', 'Night (12–5am)']

export type Bucket = { label: string; count: number; avgViews: number }

export type BestTimeAnalysis =
  | { status: 'insufficient_data'; videoCount: number; minRequired: number }
  | {
      status: 'ready'
      videoCount: number
      timezoneUsed: string
      timezoneIsAccountSpecific: boolean
      dayBuckets: Bucket[]
      bestDay: Bucket | null
      daypartBuckets: Bucket[]
      bestDaypart: Bucket | null
    }

function resolveTimezone(timezone: string | null): { tz: string; isAccountSpecific: boolean } {
  if (!timezone) return { tz: 'UTC', isAccountSpecific: false }
  try {
    // Throws for an invalid IANA zone name — validate before trusting it.
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return { tz: timezone, isAccountSpecific: true }
  } catch {
    return { tz: 'UTC', isAccountSpecific: false }
  }
}

function dayLabelFor(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(date)
}

function hourFor(date: Date, tz: string): number {
  const hourStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(date)
  return Number(hourStr)
}

function buildBuckets(order: string[], grouped: Map<string, number[]>): Bucket[] {
  return order.map((label) => {
    const views = grouped.get(label) ?? []
    const avgViews = views.length === 0 ? 0 : Math.round(views.reduce((a, b) => a + b, 0) / views.length)
    return { label, count: views.length, avgViews }
  })
}

function pickBest(buckets: Bucket[]): Bucket | null {
  const eligible = buckets.filter((b) => b.count >= MIN_VIDEOS_PER_BUCKET)
  if (eligible.length === 0) return null
  return eligible.reduce((best, b) => (b.avgViews > best.avgViews ? b : best))
}

export function analyzeBestTimeToPublish(videos: ChannelVideo[], timezone: string | null): BestTimeAnalysis {
  if (videos.length < MIN_VIDEOS_FOR_ANALYSIS) {
    return { status: 'insufficient_data', videoCount: videos.length, minRequired: MIN_VIDEOS_FOR_ANALYSIS }
  }

  const { tz, isAccountSpecific } = resolveTimezone(timezone)
  const byDay = new Map<string, number[]>()
  const byDaypart = new Map<string, number[]>()

  for (const v of videos) {
    const published = new Date(v.published_at)
    const day = dayLabelFor(published, tz)
    const daypart = daypartFor(hourFor(published, tz))
    byDay.set(day, [...(byDay.get(day) ?? []), v.views])
    byDaypart.set(daypart, [...(byDaypart.get(daypart) ?? []), v.views])
  }

  const dayBuckets = buildBuckets([...DAY_ORDER], byDay)
  const daypartBuckets = buildBuckets(DAYPART_ORDER, byDaypart)

  return {
    status: 'ready',
    videoCount: videos.length,
    timezoneUsed: tz,
    timezoneIsAccountSpecific: isAccountSpecific,
    dayBuckets,
    bestDay: pickBest(dayBuckets),
    daypartBuckets,
    bestDaypart: pickBest(daypartBuckets),
  }
}
