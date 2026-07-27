import type { Metadata } from 'next'
import { getDeals, getIntegrations, getDealStageHistory } from '@/lib/supabase/queries'
import DealsBoard from './DealsBoard'

export const metadata: Metadata = { title: 'Deals — CreatorFlow' }

export default async function DealsPage() {
  const [deals, integrations, stageHistory] = await Promise.all([
    getDeals(),
    getIntegrations(),
    getDealStageHistory(),
  ])
  const gmailConnected = integrations.some((i) => i.provider === 'gmail')
  return <DealsBoard initialDeals={deals} gmailConnected={gmailConnected} stageHistory={stageHistory} />
}
