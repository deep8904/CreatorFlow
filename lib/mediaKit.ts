import type { ChannelVideo } from '@/lib/supabase/types'

export type MediaKitVideoStats = {
  videoCount: number
  totalViews: number
  totalLikes: number
  topVideos: ChannelVideo[]
}

/**
 * Shared between the owner's management preview and the public share page,
 * so what an owner sees while configuring the kit is exactly what a
 * visitor gets — real aggregates from `channel_videos`, never a fabricated
 * subscriber count (the live YouTube fetch never populates one; see
 * supabase/functions/fetch-youtube-data/index.ts).
 */
export function computeVideoStats(videos: ChannelVideo[], topN = 5): MediaKitVideoStats {
  const totalViews = videos.reduce((acc, v) => acc + v.views, 0)
  const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0)
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, topN)
  return { videoCount: videos.length, totalViews, totalLikes, topVideos }
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
