import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import AppSidebar from '@/components/app/AppSidebar'
import { getCurrentProfile } from '@/lib/supabase/queries'
import { getAuthenticatedUser } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [profile, { user }] = await Promise.all([getCurrentProfile(), getAuthenticatedUser()])

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-linen">
      <AppSidebar name={profile?.full_name ?? 'Your account'} email={user?.email ?? ''} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
