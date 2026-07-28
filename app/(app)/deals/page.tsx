import type { Metadata } from 'next'
import { getDeals, getIntegrations, getDealStageHistory } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import DealsBoard from './DealsBoard'

export const metadata: Metadata = { title: 'Deals — CreatorFlow' }

export default async function DealsPage() {
  await requireModuleAccess('deals')
  const [deals, integrations, stageHistory] = await Promise.all([
    getDeals(),
    getIntegrations(),
    getDealStageHistory(),
  ])
  const gmailConnected = integrations.some((i) => i.provider === 'gmail')
  return <DealsBoard initialDeals={deals} gmailConnected={gmailConnected} stageHistory={stageHistory} />
}
