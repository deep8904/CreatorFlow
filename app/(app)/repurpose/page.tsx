import type { Metadata } from 'next'
import { getChannelVideos, getRepurposedContent, getDrafts, getIdeas, getCurrentProfile } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import { analyzeBestTimeToPublish } from '@/lib/bestTimeToPublish'
import RepurposeBoard from './RepurposeBoard'

export const metadata: Metadata = { title: 'Repurpose — CreatorFlow' }

export default async function RepurposePage() {
  await requireModuleAccess('repurpose')
  const [videos, repurposed, drafts, ideas, profile] = await Promise.all([
    getChannelVideos(),
    getRepurposedContent(),
    getDrafts(),
    getIdeas(),
    getCurrentProfile(),
  ])
  const bestTime = analyzeBestTimeToPublish(videos, profile?.timezone ?? null)
  return <RepurposeBoard videos={videos} repurposed={repurposed} drafts={drafts} ideas={ideas} bestTime={bestTime} />
}
