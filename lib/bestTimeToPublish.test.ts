import { describe, expect, it } from 'vitest'

import { analyzeBestTimeToPublish, MIN_VIDEOS_FOR_ANALYSIS, MIN_VIDEOS_PER_BUCKET } from './bestTimeToPublish'
import type { ChannelVideo } from '@/lib/supabase/types'

function video(publishedAt: string, views: number): ChannelVideo {
  return {
    id: publishedAt,
    user_id: 'u1',
    youtube_video_id: null,
    title: 'v',
    published_at: publishedAt,
    views,
    watch_time_minutes: 0,
    likes: 0,
    comments: 0,
    duration_seconds: null,
    created_at: publishedAt,
    repurpose_suggested: false,
  }
}

describe('analyzeBestTimeToPublish', () => {
  it('declines to analyze below the minimum video count', () => {
    const videos = Array.from({ length: MIN_VIDEOS_FOR_ANALYSIS - 1 }, (_, i) => video(`2026-01-0${(i % 9) + 1}T12:00:00Z`, 100))
    const result = analyzeBestTimeToPublish(videos, null)
    expect(result.status).toBe('insufficient_data')
  })

  it('never names a bucket as "best" unless it has at least MIN_VIDEOS_PER_BUCKET videos', () => {
    expect(MIN_VIDEOS_PER_BUCKET).toBeGreaterThan(1)
    // 10 videos spread across 6 of the 7 weekdays (Saturday gets none) —
    // by pigeonhole most buckets land below the per-bucket minimum, and
    // Saturday's bucket is empty entirely.
    const dates = [
      '2026-01-04T12:00:00Z', // Sun
      '2026-01-05T12:00:00Z', // Mon
      '2026-01-06T12:00:00Z', // Tue
      '2026-01-07T12:00:00Z', // Wed
      '2026-01-08T12:00:00Z', // Thu
      '2026-01-09T12:00:00Z', // Fri
      '2026-01-11T12:00:00Z', // Sun (2nd)
      '2026-01-12T12:00:00Z', // Mon (2nd)
      '2026-01-13T12:00:00Z', // Tue (2nd)
      '2026-01-15T12:00:00Z', // Thu (2nd)
    ]
    const videos = dates.map((d) => video(d, 100))
    const result = analyzeBestTimeToPublish(videos, null)
    if (result.status !== 'ready') throw new Error('expected ready')
    const saturdayBucket = result.dayBuckets.find((b) => b.label === 'Sat')
    expect(saturdayBucket?.count).toBe(0)
    for (const bucket of result.dayBuckets) {
      if (bucket.count < MIN_VIDEOS_PER_BUCKET) {
        expect(result.bestDay?.label).not.toBe(bucket.label)
      }
    }
  })

  it('names the best day once a bucket clears the per-bucket minimum and wins on average views', () => {
    const videos: ChannelVideo[] = [
      // Two Wednesdays with high views
      video('2026-01-07T12:00:00Z', 10000),
      video('2026-01-14T12:00:00Z', 12000),
      // Everything else with low views, spread across other days
      video('2026-01-04T12:00:00Z', 100),
      video('2026-01-05T12:00:00Z', 100),
      video('2026-01-06T12:00:00Z', 100),
      video('2026-01-08T12:00:00Z', 100),
      video('2026-01-09T12:00:00Z', 100),
      video('2026-01-10T12:00:00Z', 100),
      video('2026-01-11T12:00:00Z', 100),
      video('2026-01-12T12:00:00Z', 100),
    ]
    const result = analyzeBestTimeToPublish(videos, null)
    if (result.status !== 'ready') throw new Error('expected ready')
    expect(result.bestDay?.label).toBe('Wed')
    expect(result.bestDay?.count).toBe(2)
    expect(result.videoCount).toBe(10)
  })

  it('falls back to UTC for an invalid or missing timezone instead of throwing', () => {
    const videos = Array.from({ length: MIN_VIDEOS_FOR_ANALYSIS }, (_, i) => video(`2026-01-0${(i % 9) + 1}T12:00:00Z`, 100))
    const result = analyzeBestTimeToPublish(videos, 'Not/AZone')
    if (result.status !== 'ready') throw new Error('expected ready')
    expect(result.timezoneUsed).toBe('UTC')
    expect(result.timezoneIsAccountSpecific).toBe(false)
  })
})
