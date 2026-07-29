import type { Metadata } from 'next'
import { getAutomations, getIntegrations } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import AutomationsBoard from './AutomationsBoard'

export const metadata: Metadata = { title: 'Automations — CreatorFlow' }

export default async function AutomationsPage() {
  await requireModuleAccess('automations')
  const [automations, integrations] = await Promise.all([getAutomations(), getIntegrations()])
  const gmail = integrations.find((i) => i.provider === 'gmail')
  const gmailReallyConnected = !!gmail && !gmail.isDemo
  return <AutomationsBoard initialAutomations={automations} gmailReallyConnected={gmailReallyConnected} />
}
