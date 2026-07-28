import type { Metadata } from 'next'
import { getAutomations } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import AutomationsBoard from './AutomationsBoard'

export const metadata: Metadata = { title: 'Automations — CreatorFlow' }

export default async function AutomationsPage() {
  await requireModuleAccess('automations')
  const automations = await getAutomations()
  return <AutomationsBoard initialAutomations={automations} />
}
