import type { Metadata } from 'next'
import { getTeam } from '@/lib/supabase/queries'
import TeamBoard from './TeamBoard'

export const metadata: Metadata = { title: 'Team — CreatorFlow' }

export default async function TeamPage() {
  const team = await getTeam()
  return <TeamBoard team={team} />
}
