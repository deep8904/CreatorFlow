import type { Metadata } from 'next'
import { getDrafts, getCurrentProfile, getCurrentAccount } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import type { ViewType } from '@/components/dash/views/ViewSwitcher'
import DraftsBoard from './DraftsBoard'

export const metadata: Metadata = { title: 'Drafts — CreatorFlow' }

export default async function DraftsPage() {
  await requireModuleAccess('drafts')
  const [drafts, profile, account] = await Promise.all([getDrafts(), getCurrentProfile(), getCurrentAccount()])
  const initialView = (profile?.view_preferences?.drafts as ViewType | undefined) ?? 'table'
  return (
    <DraftsBoard
      initialDrafts={drafts}
      initialView={initialView}
      role={account?.role ?? 'owner'}
      userId={account?.userId ?? ''}
    />
  )
}
