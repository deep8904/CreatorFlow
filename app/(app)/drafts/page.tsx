import type { Metadata } from 'next'
import { getDrafts } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import DraftsBoard from './DraftsBoard'

export const metadata: Metadata = { title: 'Drafts — CreatorFlow' }

export default async function DraftsPage() {
  await requireModuleAccess('drafts')
  const drafts = await getDrafts()
  return <DraftsBoard initialDrafts={drafts} />
}
