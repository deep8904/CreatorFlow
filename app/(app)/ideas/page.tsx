import type { Metadata } from 'next'
import { getIdeas } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import IdeasBoard from './IdeasBoard'

export const metadata: Metadata = { title: 'Ideas — CreatorFlow' }

export default async function IdeasPage() {
  await requireModuleAccess('ideas')
  const ideas = await getIdeas()
  return <IdeasBoard initialIdeas={ideas} />
}
