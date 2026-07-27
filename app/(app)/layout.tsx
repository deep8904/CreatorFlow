import type { CSSProperties, ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dash/Sidebar'
import SkipLink from '@/components/dash/SkipLink'
import { MobileNavDrawer, MobileNavProvider, MobileTopBar } from '@/components/dash/MobileNav'
import { getCurrentProfile, getDeals } from '@/lib/supabase/queries'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { countUrgentDeals } from '@/lib/dealUrgency'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [profile, { user }, deals] = await Promise.all([getCurrentProfile(), getAuthenticatedUser(), getDeals()])

  if (!user) {
    redirect('/login')
  }

  const name = profile?.full_name ?? 'Your account'
  const email = user?.email ?? ''
  const urgentCount = profile?.notify_deal_reminders === false ? 0 : countUrgentDeals(deals)

  return (
    <div className="nebula-console relative h-[100dvh] w-full overflow-hidden overscroll-none bg-black font-nebula-ui text-zinc-200 antialiased selection:bg-orange-500/30 selection:text-orange-200 lg:p-2.5 2xl:p-4">
      <SkipLink />

      {/* The shell's single atmosphere layer — one grain surface and one radial
          glow for the whole app, per the effects budget (§3.7). */}
      <div aria-hidden className="nebula-grain pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_110%_70%_at_50%_-25%,rgba(234,88,12,0.10),transparent_62%)]" />
      </div>

      <MobileNavProvider>
        <div
          className="console-frame nebula-border relative z-10 flex h-full overflow-hidden bg-[#0a0a0b] lg:rounded-[1.5rem]"
          style={
            {
              '--nebula-border-gradient':
                'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 45%, rgba(234,88,12,0.10))',
            } as CSSProperties
          }
        >
          <Sidebar name={name} email={email} urgentCount={urgentCount} />
          <MobileNavDrawer name={name} email={email} />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* In normal flow, so nothing needs padding around it — the old
                `pt-14 md:pt-0` class of layout bug is gone with no capability lost. */}
            <MobileTopBar urgentCount={urgentCount} />
            {children}
          </div>
        </div>
      </MobileNavProvider>
    </div>
  )
}
