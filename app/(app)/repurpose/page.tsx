import type { Metadata } from 'next'
import { getChannelVideos, getRepurposedContent, getDrafts, getIdeas } from '@/lib/supabase/queries'
import RepurposeBoard from './RepurposeBoard'

export const metadata: Metadata = { title: 'Repurpose — CreatorFlow' }

export default async function RepurposePage() {
  const [videos, repurposed, drafts, ideas] = await Promise.all([
    getChannelVideos(),
    getRepurposedContent(),
    getDrafts(),
    getIdeas(),
  ])
  return <RepurposeBoard videos={videos} repurposed={repurposed} drafts={drafts} ideas={ideas} />
}
