import type { Metadata } from 'next'
import { requireModuleAccess } from '@/lib/supabase/access'
import { getOrCreateMediaKit, getDeals, getChannelVideos, getIntegrations } from '@/lib/supabase/queries'
import MediaKitBoard from './MediaKitBoard'

export const metadata: Metadata = { title: 'Media Kit - CreatorFlow' }

export default async function MediaKitPage() {
  await requireModuleAccess('mediaKit')

  const [mediaKit, deals, channelVideos, integrations] = await Promise.all([
    getOrCreateMediaKit(),
    getDeals(),
    getChannelVideos(),
    getIntegrations(),
  ])

  // "Closed-deal history" — paid deals only. Lost deals aren't a pitch asset,
  // and anything still open hasn't closed yet.
  const closedDeals = deals.filter((d) => d.status === 'paid')
  const youtube = integrations.find((i) => i.provider === 'youtube')

  return (
    <MediaKitBoard
      mediaKit={mediaKit}
      closedDeals={closedDeals}
      channelVideos={channelVideos}
      youtubeConnected={!!youtube}
      youtubeHandle={youtube?.accountLabel ?? null}
      youtubeIsDemo={youtube?.isDemo ?? false}
    />
  )
}
