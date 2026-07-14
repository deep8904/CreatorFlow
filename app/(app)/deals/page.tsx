import type { Metadata } from 'next'
import { getDeals } from '@/lib/supabase/queries'
import DealsBoard from './DealsBoard'

export const metadata: Metadata = { title: 'Deals — CreatorFlow' }

export default async function DealsPage() {
  const deals = await getDeals()
  return <DealsBoard initialDeals={deals} />
}
