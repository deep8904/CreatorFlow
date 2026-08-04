import type { Metadata } from 'next'
import { requireModuleAccess } from '@/lib/supabase/access'
import { getDeals, getDrafts } from '@/lib/supabase/queries'
import { canAccessModule } from '@/lib/roles'
import CalendarBoard from './CalendarBoard'

export const metadata: Metadata = { title: 'Calendar — CreatorFlow' }

export default async function CalendarPage() {
  const account = await requireModuleAccess('calendar')
  const canDeals = canAccessModule(account.role, 'deals')
  const canDrafts = canAccessModule(account.role, 'drafts')

  // Fetch only what this role can actually see — an empty array here reads
  // as "you don't have this category," not "nothing exists," matching the
  // pattern already used on the Dashboard.
  const [deals, drafts] = await Promise.all([
    canDeals ? getDeals() : Promise.resolve([]),
    canDrafts ? getDrafts() : Promise.resolve([]),
  ])

  return <CalendarBoard deals={deals} drafts={drafts} canDeals={canDeals} canDrafts={canDrafts} />
}
