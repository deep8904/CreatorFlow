import type { Metadata } from 'next'
import { getAutomations, getAutomationActivity, getIntegrations } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import AutomationsBoard from './AutomationsBoard'

export const metadata: Metadata = { title: 'Automations — CreatorFlow' }

export default async function AutomationsPage() {
  await requireModuleAccess('automations')
  const [automations, activity, integrations] = await Promise.all([
    getAutomations(),
    getAutomationActivity(),
    getIntegrations(),
  ])
  const gmail = integrations.find((i) => i.provider === 'gmail')
  const gmailReallyConnected = !!gmail && !gmail.isDemo
  return <AutomationsBoard initialAutomations={automations} activity={activity} gmailReallyConnected={gmailReallyConnected} />
}
