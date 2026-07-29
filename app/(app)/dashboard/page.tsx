import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Handshake, DollarSign, TrendingUp, Lightbulb } from 'lucide-react'
import {
  getDeals,
  getIdeas,
  getDrafts,
  getCurrentProfile,
  getChannelStats,
  getIntegrations,
  getCurrentAccount,
} from '@/lib/supabase/queries'
import type { Deal } from '@/lib/supabase/types'
import { canAccessModule } from '@/lib/roles'
import { DashboardHeader, CapturePills } from '@/components/dash/DashboardHeader'
import { DateRangeMenu } from '@/components/dash/DateRangeMenu'
import { MetricGrid, type Metric } from '@/components/dash/MetricCard'
import { Panel } from '@/components/dash/Panel'
import { LineTrendChart, type TrendPoint } from '@/components/dash/LineTrendChart'
import { StageFunnelChart, type StageBar } from '@/components/dash/StageFunnelChart'
import { GaugeChart } from '@/components/dash/GaugeChart'
import { BreakdownList, type BreakdownRow } from '@/components/dash/BreakdownList'
import { DealsTable, type DealRow } from '@/components/dash/DealsTable'
import { AIAssistantPanel } from '@/components/dash/AIAssistantPanel'
import { EmptyDashboard } from '@/components/dash/EmptyDashboard'

export const metadata: Metadata = { title: 'Dashboard — CreatorFlow' }

function formatMoney(d: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: d >= 100_000 ? 'compact' : 'standard',
  }).format(d)
}

function formatMoneyFull(d: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d)
}

const DEAL_STAGE_LABEL: Record<Deal['status'], string> = {
  inbound: 'Inbound',
  negotiating: 'Negotiating',
  contracted: 'Contracted',
  delivered: 'Delivered',
  paid: 'Paid',
  lost: 'Lost',
}

const FUNNEL_STAGES: Deal['status'][] = ['inbound', 'negotiating', 'contracted', 'delivered', 'paid']

/**
 * `due_date` is a date-only column and this page is server-rendered, so the
 * comparison is UTC day-part only — a naive `new Date(due) < new Date()`
 * drifts by up to a day depending on server timezone.
 */
function dueMeta(due: string | null): { label: string | null; overdue: boolean } {
  if (!due) return { label: null, overdue: false }
  const d = new Date(due + 'T00:00:00Z')
  const today = new Date()
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const days = Math.round((d.getTime() - todayUTC) / 86_400_000)
  const label =
    days < 0
      ? 'Overdue'
      : days === 0
        ? 'Today'
        : days === 1
          ? 'Tomorrow'
          : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(d)
  return { label, overdue: days < 0 }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const days = range === '30' || range === '90' ? Number(range) : 7

  const [deals, ideas, drafts, profile, channelStats, integrations, account] = await Promise.all([
    getDeals(),
    getIdeas(),
    getDrafts(),
    getCurrentProfile(),
    getChannelStats(days),
    getIntegrations(),
    getCurrentAccount(),
  ])
  const role = account?.role ?? 'owner'
  // A role without a module's access always gets an RLS-empty array for it,
  // which is indistinguishable from "genuinely zero" — a Manager with no
  // ideas access would otherwise see "Ideas captured: 0" and reasonably
  // read that as "no ideas exist," not "you can't see them." Every tile and
  // panel below is gated on the module it actually represents, hidden
  // rather than shown-as-zero, matching the pattern already used for nav/
  // CapturePills/EmptyDashboard elsewhere in the app.
  const canDeals = canAccessModule(role, 'deals')
  const canIdeas = canAccessModule(role, 'ideas')
  const canAnalyticsModule = canAccessModule(role, 'analytics')

  const youtube = integrations.find((i) => i.provider === 'youtube')
  const youtubeConnected = !!youtube
  // Whether to show the chart region at all is about connection status, not
  // about whether the *currently selected* range happens to have rows — a
  // connected account with no activity in the last 7 days is not the same
  // as a disconnected one, and conflating them told a connected user to
  // "Connect YouTube" while Analytics (a fixed 120-day window) showed their
  // real data one click away.
  const showTrend = youtubeConnected
  const hasTrendData = channelStats.length > 0

  const openDeals = deals.filter((d) => d.status !== 'paid' && d.status !== 'lost')
  const paidDeals = deals.filter((d) => d.status === 'paid')
  const revenueCollected = paidDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const pipelineValue = openDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const ideasInProgress = ideas.filter((i) => i.status === 'in_progress').length

  const hasAnyData = deals.length > 0 || ideas.length > 0

  const firstName = profile?.full_name?.split(' ')[0]
  const needsNextStep = deals.filter((d) => d.status !== 'paid' && d.status !== 'delivered' && d.status !== 'lost')
  const description =
    needsNextStep.length === 0
      ? 'Nothing needs a next step right now.'
      : needsNextStep.length === 1
        ? '1 deal needs a next step.'
        : `${needsNextStep.length} deals need a next step.`

  const metrics: Metric[] = [
    ...(canDeals
      ? [
          { label: 'Open deals', value: String(openDeals.length), hint: `of ${deals.length} total`, icon: <Handshake size={14} /> },
          {
            label: 'Collected to date',
            value: formatMoney(revenueCollected),
            title: formatMoneyFull(revenueCollected),
            hint: paidDeals.length === 0 ? 'no deals marked paid yet' : `across ${paidDeals.length} deals`,
            icon: <DollarSign size={14} />,
          },
          {
            label: 'Pipeline value',
            value: formatMoney(pipelineValue),
            title: formatMoneyFull(pipelineValue),
            hint: `across ${openDeals.length} open deals`,
            icon: <TrendingUp size={14} />,
          },
        ]
      : []),
    ...(canIdeas
      ? [
          {
            label: 'Ideas captured',
            value: String(ideas.length),
            hint: `${ideasInProgress} in progress`,
            icon: <Lightbulb size={14} />,
          },
        ]
      : []),
  ]

  const stageBars: StageBar[] = FUNNEL_STAGES.map((status) => {
    const inStage = deals.filter((d) => d.status === status)
    return {
      label: DEAL_STAGE_LABEL[status],
      count: inStage.length,
      value: inStage.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100,
    }
  })

  const ideaIdsWithDraft = new Set(drafts.map((d) => d.idea_id).filter((id): id is string => id !== null))
  const ideasWithDraftCount = ideas.filter((i) => ideaIdsWithDraft.has(i.id)).length
  const draftConversionPct = ideas.length === 0 ? 0 : Math.round((ideasWithDraftCount / ideas.length) * 100)

  // "By pipeline value" — matches openDeals/pipelineValue above. A closed
  // deal ('paid' or 'lost') isn't pipeline anymore, so it's excluded here
  // too; counting it in would rank a brand's now-finished deal alongside
  // brands who still have live pipeline with the creator.
  const brandTotals = new Map<string, number>()
  for (const d of openDeals) {
    const brand = d.brand_name?.trim() || 'Unnamed brand'
    brandTotals.set(brand, (brandTotals.get(brand) ?? 0) + (d.rate_amount_cents ?? 0) / 100)
  }
  const breakdownRows: BreakdownRow[] = [...brandTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, formatted: formatMoney(value) }))

  // Most urgent first — overdue, then soonest due, deals with no due date last.
  // A "needs a next step" panel that sorts by creation order instead buries
  // the one thing it exists to surface.
  const sortKey = (d: Deal) => (d.due_date ? new Date(d.due_date + 'T00:00:00Z').getTime() : Infinity)
  const tableRows: DealRow[] = [...needsNextStep]
    .sort((a, b) => sortKey(a) - sortKey(b))
    .slice(0, 8)
    .map((d) => {
      const due = dueMeta(d.due_date)
      return {
        id: d.id,
        brand: d.brand_name ?? 'Untitled deal',
        stage: DEAL_STAGE_LABEL[d.status],
        stageTone: due.overdue ? 'attention' : d.status === 'delivered' ? 'positive' : 'default',
        value: d.rate_amount_cents === null ? '—' : formatMoney(d.rate_amount_cents / 100),
        due: due.label,
      }
    })

  // Money that's committed but not yet in hand — Contracted/Delivered deals
  // with a due date. Creator-economy research consistently flags payment
  // delays and 30%+ month-to-month income swings as top financial stress
  // points; this doesn't fix payment timing, but it makes what's coming
  // visible instead of a surprise.
  const upcomingIncomeDeals = deals.filter(
    (d) => (d.status === 'contracted' || d.status === 'delivered') && d.due_date
  )
  const upcomingIncomeTotal = upcomingIncomeDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const upcomingIncomeRows: DealRow[] = [...upcomingIncomeDeals]
    .sort((a, b) => sortKey(a) - sortKey(b))
    .slice(0, 6)
    .map((d) => {
      const due = dueMeta(d.due_date)
      return {
        id: d.id,
        brand: d.brand_name ?? 'Untitled deal',
        stage: DEAL_STAGE_LABEL[d.status],
        stageTone: due.overdue ? 'attention' : 'default',
        value: d.rate_amount_cents === null ? '—' : formatMoney(d.rate_amount_cents / 100),
        due: due.label,
      }
    })

  const trendPoints: TrendPoint[] = channelStats.map((s) => ({
    label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(s.stat_date + 'T00:00:00Z')),
    value: s.views,
  }))

  return (
    <>
      <DashboardHeader
        eyebrow="Dashboard"
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        description={description}
        right={
          <>
            <DateRangeMenu current={String(days)} />
            <CapturePills role={role} />
          </>
        }
      />

      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!hasAnyData ? (
            <EmptyDashboard role={role} />
          ) : (
            <div className="flex flex-col gap-6">
              <MetricGrid metrics={metrics} />

              {(() => {
                const row1: { key: string; node: ReactNode }[] = []
                if (canAnalyticsModule) {
                  row1.push({
                    key: 'trend',
                    node: (
                      <Panel title="Channel views" titleId="trend-h" eyebrow={`Last ${days} days`}>
                        <div className="px-5 pb-5">
                          {!showTrend ? (
                            <div className="flex h-[180px] flex-col items-center justify-center gap-3 text-center">
                              <p className="font-nebula-ui text-[12.5px] text-zinc-500">
                                Connect YouTube to see your performance here.
                              </p>
                              <a
                                href="/settings"
                                className="inline-flex h-8 items-center rounded-[9999px] border border-white/10 px-3.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                              >
                                Connect YouTube
                              </a>
                            </div>
                          ) : hasTrendData ? (
                            <>
                              <LineTrendChart points={trendPoints} unit="views" />
                              {youtube?.isDemo && (
                                <p className="mt-3 font-nebula-ui text-[10.5px] text-zinc-600">
                                  Seeded demo data — in production this pulls live from the YouTube Analytics API.
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex h-[180px] flex-col items-center justify-center gap-2 text-center">
                              <p className="font-nebula-ui text-[12.5px] text-zinc-500">
                                No views in the last {days} days.
                              </p>
                              <p className="font-nebula-ui text-[12px] text-zinc-600">
                                Try a wider range, or check back once your next video is live.
                              </p>
                            </div>
                          )}
                        </div>
                      </Panel>
                    ),
                  })
                }
                if (canDeals) {
                  row1.push({
                    key: 'stage',
                    node: (
                      <Panel title="Deals by stage" titleId="stage-h">
                        <div className="px-5 pb-5">
                          <StageFunnelChart stages={stageBars} />
                        </div>
                      </Panel>
                    ),
                  })
                }

                const row2: { key: string; node: ReactNode }[] = []
                if (canIdeas) {
                  row2.push({
                    key: 'gauge',
                    node: (
                      <Panel title="Ideas shipped" titleId="gauge-h">
                        <div className="flex flex-col items-center px-5 pb-6">
                          <GaugeChart pct={draftConversionPct} value={`${draftConversionPct}%`} label="Ideas turned into drafts" />
                        </div>
                      </Panel>
                    ),
                  })
                }
                if (canDeals) {
                  row2.push(
                    {
                      key: 'brands',
                      node: (
                        <Panel title="Top brands" titleId="brands-h">
                          <BreakdownList title="By pipeline value" rows={breakdownRows} />
                        </Panel>
                      ),
                    },
                    {
                      key: 'next-step',
                      node: (
                        <Panel title="Needs a next step" titleId="table-h" action={{ label: 'View all', href: '/deals' }}>
                          <div className="pb-2">
                            <DealsTable rows={tableRows} />
                          </div>
                        </Panel>
                      ),
                    },
                  )
                }

                const row3: { key: string; node: ReactNode }[] = []
                if (canDeals) {
                  row3.push(
                    {
                      key: 'upcoming',
                      node: (
                        <Panel
                          title="Upcoming income"
                          titleId="upcoming-h"
                          eyebrow={upcomingIncomeDeals.length > 0 ? `${formatMoney(upcomingIncomeTotal)} committed` : undefined}
                        >
                          {upcomingIncomeRows.length === 0 ? (
                            <p className="px-5 pb-5 font-nebula-ui text-[12.5px] text-zinc-500">
                              Nothing contracted or delivered yet — this fills in once a deal is locked in.
                            </p>
                          ) : (
                            <div className="pb-2">
                              <DealsTable rows={upcomingIncomeRows} />
                            </div>
                          )}
                        </Panel>
                      ),
                    },
                    {
                      key: 'ai',
                      node: (
                        <Panel title="AI Assistant" titleId="ai-h">
                          <div className="h-[320px]">
                            <AIAssistantPanel />
                          </div>
                        </Panel>
                      ),
                    },
                  )
                }

                // row1/row3 only ever have up to 2 possible panels — a single
                // remaining panel just uses the base grid-cols-1, no override needed.
                const gridColsClass = (count: number, twoColTemplate: string) => (count === 2 ? twoColTemplate : '')

                return (
                  <>
                    {row1.length > 0 && (
                      <div className={`grid grid-cols-1 gap-6 ${gridColsClass(row1.length, 'lg:grid-cols-[minmax(0,1fr)_320px]')}`}>
                        {row1.map((item) => (
                          <div key={item.key}>{item.node}</div>
                        ))}
                      </div>
                    )}

                    {row2.length > 0 && (
                      <div className={`grid grid-cols-1 gap-6 ${row2.length >= 3 ? 'lg:grid-cols-3' : row2.length === 2 ? 'lg:grid-cols-2' : ''}`}>
                        {row2.map((item) => (
                          <div key={item.key}>{item.node}</div>
                        ))}
                      </div>
                    )}

                    {row3.length > 0 && (
                      <div className={`grid grid-cols-1 gap-6 ${gridColsClass(row3.length, 'lg:grid-cols-[minmax(0,1fr)_360px]')}`}>
                        {row3.map((item) => (
                          <div key={item.key}>{item.node}</div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
