import type { Metadata } from 'next'
import { getChannelVideos, getRepurposedContent } from '@/lib/supabase/queries'
import RepurposeBoard from './RepurposeBoard'

export const metadata: Metadata = { title: 'Repurpose — CreatorFlow' }

export default async function RepurposePage() {
  const [videos, repurposed] = await Promise.all([getChannelVideos(), getRepurposedContent()])
  return <RepurposeBoard videos={videos} repurposed={repurposed} />
}
