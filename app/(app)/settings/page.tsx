import type { Metadata } from 'next'
import { getCurrentProfile, getIntegrations, getCurrentAccount } from '@/lib/supabase/queries'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import SettingsBoard from './SettingsBoard'

export const metadata: Metadata = { title: 'Settings — CreatorFlow' }

export default async function SettingsPage() {
  const [profile, integrations, { user }, account] = await Promise.all([
    getCurrentProfile(),
    getIntegrations(),
    getAuthenticatedUser(),
    getCurrentAccount(),
  ])

  const gmail = integrations.find((i) => i.provider === 'gmail')
  const youtube = integrations.find((i) => i.provider === 'youtube')

  return (
    <SettingsBoard
      fullName={profile?.full_name ?? ''}
      email={user?.email ?? ''}
      gmailConnected={!!gmail}
      gmailAccountLabel={gmail?.accountLabel ?? null}
      youtubeConnected={!!youtube}
      youtubeAccountLabel={youtube?.accountLabel ?? null}
      notifyDealReminders={profile?.notify_deal_reminders ?? true}
      isOwner={(account?.role ?? 'owner') === 'owner'}
    />
  )
}
