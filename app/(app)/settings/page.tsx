import type { Metadata } from 'next'
import { getCurrentProfile, getIntegrations } from '@/lib/supabase/queries'
import { getAuthenticatedUser } from '@/lib/supabase/auth'
import SettingsBoard from './SettingsBoard'

export const metadata: Metadata = { title: 'Settings — CreatorFlow' }

export default async function SettingsPage() {
  const [profile, integrations, { user }] = await Promise.all([
    getCurrentProfile(),
    getIntegrations(),
    getAuthenticatedUser(),
  ])

  return (
    <SettingsBoard
      fullName={profile?.full_name ?? ''}
      email={user?.email ?? ''}
      gmailConnected={integrations.some((i) => i.provider === 'gmail')}
      youtubeConnected={integrations.some((i) => i.provider === 'youtube')}
    />
  )
}
