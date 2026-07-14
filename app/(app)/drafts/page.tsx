import type { Metadata } from 'next'
import { getDrafts } from '@/lib/supabase/queries'
import DraftsBoard from './DraftsBoard'

export const metadata: Metadata = { title: 'Drafts — CreatorFlow' }

export default async function DraftsPage() {
  const drafts = await getDrafts()
  return <DraftsBoard initialDrafts={drafts} />
}
