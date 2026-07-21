import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Handshake, Lightbulb, FileText, Link2 } from 'lucide-react'
import { getDeals, getIdeas, getCurrentProfile, getChannelStats, getIntegrations } from '@/lib/supabase/queries'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export const metadata: Metadata = { title: 'Dashboard — CreatorFlow' }

const IDEA_STATUS_LABEL: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  done: 'Done',
  archived: 'Archived',
}

const DEAL_STAGE_LABEL: Record<string, string> = {
  inbound: 'Inbound',
  negotiating: 'Negotiating',
  contracted: 'Contracted',
  delivered: 'Delivered',
  paid: 'Paid',
}

export default async function DashboardPage() {
  const [deals, ideas, profile, channelStats, integrations] = await Promise.all([
    getDeals(),
    getIdeas(),
    getCurrentProfile(),
    getChannelStats(7),
    getIntegrations(),
  ])
  const youtubeConnected = integrations.some((i) => i.provider === 'youtube')
  const weekViews = channelStats.reduce((acc, s) => acc + s.views, 0)
  const weekSubsGained = channelStats.reduce((acc, s) => acc + s.subscribers_gained, 0)
  const latestSubs = channelStats[channelStats.length - 1]?.subscribers_total ?? null

  const openDeals = deals.filter((d) => d.status !== 'paid' && d.status !== 'lost')
  const revenueMtd = deals
    .filter((d) => d.status === 'paid')
    .reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const ideasInProgress = ideas.filter((i) => i.status === 'in_progress').length

  const needsAttention = deals
    .filter((d) => d.status !== 'paid' && d.status !== 'delivered' && d.status !== 'lost')
    .slice(0, 5)

  const recentIdeas = ideas.slice(0, 3)

  const hasAnyData = deals.length > 0 || ideas.length > 0

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-[12.5px] font-medium text-ash mb-0.5" style={{ letterSpacing: '-0.2px' }}>
            Good morning
          </p>
          <h1 className="text-app-h1 text-carbon">
            {profile?.full_name ?? 'there'}
          </h1>
        </div>

        {/* Primary actions — greeting, then the things you actually came here
            to do, before any stats. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Log a deal', href: '/deals?new=1', icon: Handshake },
            { label: 'Capture an idea', href: '/ideas?new=1', icon: Lightbulb },
            { label: 'Start a draft', href: '/drafts?new=1', icon: FileText },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="group">
              <Card variant="subtle" padding="sm" className="flex items-center gap-3 hover:border-lavender/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-lavender/10 flex items-center justify-center shrink-0 group-hover:bg-lavender/15 transition-colors">
                  <action.icon size={16} className="text-lavender" strokeWidth={2} />
                </div>
                <span className="text-[13.5px] font-semibold text-carbon flex-1" style={{ letterSpacing: '-0.25px' }}>
                  {action.label}
                </span>
                <ArrowRight size={14} className="text-ash shrink-0" />
              </Card>
            </Link>
          ))}
        </div>

        {!hasAnyData ? (
          <EmptyState
            icon={<Lightbulb size={18} className="text-ash" strokeWidth={2} />}
            title="Nothing here yet."
            description="Pick one of the actions above to get started."
          />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Open Deals', value: String(openDeals.length) },
                { label: 'Revenue MTD', value: `$${revenueMtd.toLocaleString()}` },
                { label: 'Ideas Captured', value: String(ideas.length), delta: `${ideasInProgress} in progress` },
              ].map((s) => (
                <Card key={s.label} variant="subtle" padding="lg">
                  <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-3">
                    {s.label}
                  </p>
                  <p
                    className="font-bold text-carbon mb-1"
                    style={{ fontSize: '22px', lineHeight: 1, letterSpacing: '-0.04em' }}
                  >
                    {s.value}
                  </p>
                  {s.delta && <p className="text-[11.5px] font-medium text-ash">{s.delta}</p>}
                </Card>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Needs attention — 2 cols */}
              <Card variant="subtle" padding="none" className="lg:col-span-2 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-fog">
                  <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                    Needs your attention
                  </h2>
                  <Link href="/deals" className="text-[12px] font-medium text-lavender hover:opacity-70 transition-opacity">
                    View all
                  </Link>
                </div>
                {needsAttention.length === 0 ? (
                  <p className="px-5 py-8 text-[13px] text-graphite text-center">Nothing needs your attention right now.</p>
                ) : (
                  <div>
                    {needsAttention.map((deal, i) => (
                      <Link
                        key={deal.id}
                        href={`/deals?deal=${deal.id}`}
                        className={`flex items-center justify-between px-5 py-4 hover:bg-linen transition-colors ${i < needsAttention.length - 1 ? 'border-b border-fog' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={deal.brand_name ?? '?'} size="md" />
                          <div>
                            <p className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                              {deal.brand_name ?? 'Untitled deal'}
                            </p>
                            <p className="text-[12px] text-ash">{DEAL_STAGE_LABEL[deal.status]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-label text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-fog text-graphite">
                            {DEAL_STAGE_LABEL[deal.status]}
                          </span>
                          <ArrowRight size={13} className="text-fog" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              {/* Recent ideas */}
              <Card variant="subtle" padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-fog">
                  <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                    Recent ideas
                  </h2>
                  <Link href="/ideas" className="text-[12px] font-medium text-lavender hover:opacity-70 transition-opacity">
                    View all
                  </Link>
                </div>
                {recentIdeas.length === 0 ? (
                  <p className="px-5 py-8 text-[13px] text-graphite text-center">No ideas captured yet.</p>
                ) : (
                  <div>
                    {recentIdeas.map((idea, i) => (
                      <Link
                        key={idea.id}
                        href={`/ideas?open=${idea.id}`}
                        className={`flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-linen transition-colors ${i < recentIdeas.length - 1 ? 'border-b border-fog' : ''}`}
                      >
                        <p className="text-[13px] font-medium text-carbon flex-1 leading-snug" style={{ letterSpacing: '-0.25px' }}>
                          {idea.title}
                        </p>
                        <span className={`font-label text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${idea.status === 'done' ? 'bg-lavender/10 text-lavender' : 'bg-fog text-graphite'}`}>
                          {IDEA_STATUS_LABEL[idea.status]}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              {/* Channel performance */}
              <Card variant="subtle" padding="none" className="lg:col-span-2 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-fog">
                  <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                    This week&apos;s performance
                  </h2>
                  <Link href="/analytics" className="text-[12px] font-medium text-lavender hover:opacity-70 transition-opacity">
                    Full analytics
                  </Link>
                </div>
                {!youtubeConnected || channelStats.length === 0 ? (
                  <div className="py-6">
                    <EmptyState
                      icon={<Link2 size={16} className="text-ash" strokeWidth={2} />}
                      title="Connect YouTube to see your performance here."
                      action={
                        <Button href="/settings" size="sm">
                          Connect YouTube
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 divide-x divide-fog">
                    {[
                      { label: 'Views this week', value: formatCompact(weekViews) },
                      { label: 'New subscribers', value: `+${formatCompact(weekSubsGained)}` },
                      { label: 'Total subscribers', value: latestSubs !== null ? formatCompact(latestSubs) : '—' },
                    ].map((s) => (
                      <div key={s.label} className="px-5 py-5">
                        <p className="font-label text-[10px] font-semibold text-ash uppercase tracking-widest mb-1.5">{s.label}</p>
                        <p className="font-bold text-carbon" style={{ fontSize: '19px', letterSpacing: '-0.03em' }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
