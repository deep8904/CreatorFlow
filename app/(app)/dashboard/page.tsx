import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { getDeals, getIdeas, getCurrentProfile, getChannelStats, getIntegrations } from '@/lib/supabase/queries'

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

function initialsFor(brand: string | null) {
  if (!brand) return '?'
  return brand.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
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

  const openDeals = deals.filter((d) => d.status !== 'paid')
  const revenueMtd = deals
    .filter((d) => d.status === 'paid')
    .reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const ideasInProgress = ideas.filter((i) => i.status === 'in_progress').length

  const needsAttention = deals
    .filter((d) => d.status !== 'paid' && d.status !== 'delivered')
    .slice(0, 5)

  const recentIdeas = ideas.slice(0, 3)

  const hasAnyData = deals.length > 0 || ideas.length > 0

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container">

        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[12.5px] font-medium text-ash mb-0.5" style={{ letterSpacing: '-0.2px' }}>
              Good morning
            </p>
            <h1 className="text-app-h1 text-carbon">
              {profile?.full_name ?? 'there'}
            </h1>
          </div>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-paper-white bg-lavender px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            style={{ letterSpacing: '-0.25px', boxShadow: 'rgba(145,141,246,0.3) 0px 3px 12px 0px' }}
          >
            New deal
            <ArrowRight size={13} />
          </Link>
        </div>

        {!hasAnyData ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-11 h-11 rounded-xl bg-fog flex items-center justify-center">
              <Lightbulb size={18} className="text-ash" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-carbon mb-1">Nothing here yet.</p>
              <p className="text-[13px] text-graphite max-w-[340px]">
                Connect Gmail to start tracking deals, or add your first idea to get going.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/deals" className="text-[13px] font-medium text-lavender hover:opacity-70 transition-opacity">
                Connect Gmail
              </Link>
              <Link href="/ideas" className="text-[13px] font-medium text-lavender hover:opacity-70 transition-opacity">
                Add your first idea
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Open Deals', value: String(openDeals.length) },
                { label: 'Revenue MTD', value: `$${revenueMtd.toLocaleString()}` },
                { label: 'Ideas Captured', value: String(ideas.length), delta: `${ideasInProgress} in progress` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-paper-white border border-fog rounded-xl p-5"
                  style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px 0px' }}
                >
                  <p className="text-[12px] font-medium text-ash mb-3" style={{ letterSpacing: '-0.2px' }}>
                    {s.label}
                  </p>
                  <p
                    className="font-bold text-carbon mb-1"
                    style={{ fontSize: '22px', lineHeight: 1, letterSpacing: '-0.04em' }}
                  >
                    {s.value}
                  </p>
                  {s.delta && <p className="text-[11.5px] font-medium text-ash">{s.delta}</p>}
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Needs attention — 2 cols */}
              <div
                className="lg:col-span-2 bg-paper-white border border-fog rounded-xl overflow-hidden"
                style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px 0px' }}
              >
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
                        href="/deals"
                        className={`flex items-center justify-between px-5 py-4 hover:bg-linen transition-colors ${i < needsAttention.length - 1 ? 'border-b border-fog' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-lavender/10 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-lavender">{initialsFor(deal.brand_name)}</span>
                          </div>
                          <div>
                            <p className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                              {deal.brand_name ?? 'Untitled deal'}
                            </p>
                            <p className="text-[12px] text-ash">{DEAL_STAGE_LABEL[deal.status]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-fog text-graphite">
                            {DEAL_STAGE_LABEL[deal.status]}
                          </span>
                          <ArrowRight size={13} className="text-fog" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions — 1 col */}
              <div
                className="bg-paper-white border border-fog rounded-xl overflow-hidden"
                style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px 0px' }}
              >
                <div className="px-5 py-4 border-b border-fog">
                  <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                    Quick actions
                  </h2>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {[
                    { label: 'Log a new deal', href: '/deals', accent: 'bg-lavender text-paper-white' },
                    { label: 'Capture an idea', href: '/ideas', accent: 'bg-paper-white border border-fog text-carbon' },
                    { label: 'Start a draft', href: '/drafts', accent: 'bg-paper-white border border-fog text-carbon' },
                    { label: 'View analytics', href: '/analytics', accent: 'bg-paper-white border border-fog text-carbon' },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium transition-opacity hover:opacity-80 ${action.accent}`}
                      style={{ letterSpacing: '-0.25px' }}
                    >
                      {action.label}
                      <ArrowRight size={13} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent ideas */}
              <div
                className="bg-paper-white border border-fog rounded-xl overflow-hidden"
                style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px 0px' }}
              >
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
                        href="/ideas"
                        className={`flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-linen transition-colors ${i < recentIdeas.length - 1 ? 'border-b border-fog' : ''}`}
                      >
                        <p className="text-[13px] font-medium text-carbon flex-1 leading-snug" style={{ letterSpacing: '-0.25px' }}>
                          {idea.title}
                        </p>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${idea.status === 'done' ? 'bg-mint-wash text-mint' : 'bg-fog text-graphite'}`}>
                          {IDEA_STATUS_LABEL[idea.status]}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Channel performance */}
              <div
                className="lg:col-span-2 bg-paper-white border border-fog rounded-xl overflow-hidden"
                style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px 0px' }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-fog">
                  <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                    This week&apos;s performance
                  </h2>
                  <Link href="/analytics" className="text-[12px] font-medium text-lavender hover:opacity-70 transition-opacity">
                    Full analytics
                  </Link>
                </div>
                {!youtubeConnected || channelStats.length === 0 ? (
                  <p className="px-5 py-10 text-[13px] text-graphite text-center">
                    Connect YouTube to see your performance here.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 divide-x divide-fog">
                    {[
                      { label: 'Views this week', value: formatCompact(weekViews) },
                      { label: 'New subscribers', value: `+${formatCompact(weekSubsGained)}` },
                      { label: 'Total subscribers', value: latestSubs !== null ? formatCompact(latestSubs) : '—' },
                    ].map((s) => (
                      <div key={s.label} className="px-5 py-5">
                        <p className="text-[11.5px] text-ash mb-1.5">{s.label}</p>
                        <p className="font-bold text-carbon" style={{ fontSize: '19px', letterSpacing: '-0.03em' }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
