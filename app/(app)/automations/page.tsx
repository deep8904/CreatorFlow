import type { Metadata } from 'next'
import { getAutomations } from '@/lib/supabase/queries'
import AutomationsBoard from './AutomationsBoard'

export const metadata: Metadata = { title: 'Automations — CreatorFlow' }

export default async function AutomationsPage() {
  const automations = await getAutomations()
  return <AutomationsBoard initialAutomations={automations} />
}
