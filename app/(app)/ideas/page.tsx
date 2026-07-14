import type { Metadata } from 'next'
import { getIdeas } from '@/lib/supabase/queries'
import IdeasBoard from './IdeasBoard'

export const metadata: Metadata = { title: 'Ideas — CreatorFlow' }

export default async function IdeasPage() {
  const ideas = await getIdeas()
  return <IdeasBoard initialIdeas={ideas} />
}
