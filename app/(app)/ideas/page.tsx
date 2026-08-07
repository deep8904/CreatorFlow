import type { Metadata } from 'next'
import { getIdeas, getCurrentProfile } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import type { ViewType } from '@/components/dash/views/ViewSwitcher'
import IdeasBoard from './IdeasBoard'

export const metadata: Metadata = { title: 'Ideas - CreatorFlow' }

export default async function IdeasPage() {
  await requireModuleAccess('ideas')
  const [ideas, profile] = await Promise.all([getIdeas(), getCurrentProfile()])
  const initialView = (profile?.view_preferences?.ideas as ViewType | undefined) ?? 'table'
  return <IdeasBoard initialIdeas={ideas} initialView={initialView} />
}
