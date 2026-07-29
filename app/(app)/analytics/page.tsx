import type { Metadata } from 'next'
import { BarChart2 } from 'lucide-react'
import { getChannelStats, getChannelVideos, getIntegrations, getDeals } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { MetricGrid, type Metric } from '@/components/dash/MetricCard'
import { Panel } from '@/components/dash/Panel'
import { LineTrendChart, type TrendPoint } from '@/components/dash/LineTrendChart'
import { RefreshYoutubeButton } from '@/components/dash/RefreshYoutubeButton'
import { FOCUS } from '@/components/dash/tokens'

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100,
  )
}

export const metadata: Metadata = { title: 'Analytics — CreatorFlow' }

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7)
}

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export default async function AnalyticsPage() {
  await requireModuleAccess('analytics')
  const [integrations, stats, videos, deals] = await Promise.all([
    getIntegrations(),
    getChannelStats(120),
    getChannelVideos(),
    getDeals(),
  ])
  const youtube = integrations.find((i) => i.provider === 'youtube')
  const youtubeConnected = !!youtube

  if (!youtubeConnected) {
    return (
      <>
        <DashboardHeader eyebrow="Analytics" title="Analytics" description="Your YouTube channel performance" />
        <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
              <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                <BarChart2 size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="font-nebula-heading text-[16px] font-semibold text-white">
                  Connect YouTube to see your performance here.
                </p>
              </div>
              <a
                href="/settings"
                className={`nebula-cta nebula-cta--wide inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
              >
                <span className="nebula-cta__label">Connect YouTube</span>
              </a>
            </div>
          </div>
        </main>
      </>
    )
  }

  // Connected but no daily-stats trend to show — either a real connection
  // that hasn't fetched yet, or one whose Google grant only covers the Data
  // API (video list, channel snippet), not the separate Analytics API a
  // views/watch-time trend needs. Either way, showing the "not connected"
  // empty state here would be wrong — the account IS connected, and its
  // real video list (if fetched) still belongs on screen.
  if (stats.length === 0) {
    const topVideosOnly = [...videos].sort((a, b) => b.views - a.views).slice(0, 5)
    return (
      <>
        <DashboardHeader eyebrow="Analytics" title="Analytics" description="Your YouTube channel performance" />
        <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {!youtube?.isDemo && (
              <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <p className="font-nebula-ui text-[12.5px] text-zinc-400">
                  Connected as {youtube?.accountLabel ?? 'your channel'}. Views/watch-time trend isn&apos;t available —
                  this connection only has the YouTube Data scope, not the separate Analytics scope a daily trend needs.
                </p>
                <RefreshYoutubeButton />
              </div>
            )}
            <Panel title="Top videos" titleId="videos-h">
              {topVideosOnly.length === 0 ? (
                <p className="px-5 pb-5 font-nebula-ui text-[12.5px] text-zinc-500">
                  No video data yet{youtube?.isDemo ? '.' : ' — try refreshing.'}
                </p>
              ) : (
                <ul className="pb-2">
                  {topVideosOnly.map((v, i) => (
                    <li key={v.id} className="flex items-center gap-4 border-t border-white/[0.05] px-5 py-3 first:border-t-0">
                      <span className="w-4 shrink-0 font-nebula-mono text-[11px] text-zinc-600">{i + 1}</span>
                      <p className="min-w-0 flex-1 truncate font-nebula-ui text-[13px] font-medium text-zinc-200">{v.title}</p>
                      <span className="shrink-0 font-nebula-mono text-[12px] text-zinc-500">{formatCompact(v.views)} views</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </main>
      </>
    )
  }

  const currentMonth = monthKey(stats[stats.length - 1].stat_date)
  const monthDates = [...new Set(stats.map((s) => monthKey(s.stat_date)))].sort()
  const previousMonth = monthDates[monthDates.indexOf(currentMonth) - 1] ?? null

  const thisMonthRows = stats.filter((s) => monthKey(s.stat_date) === currentMonth)
  // Compare against the same number of elapsed days last month, not the full
  // previous month — otherwise a partial current month always looks like a
  // decline purely because fewer days have happened so far.
  const lastMonthFull = previousMonth ? stats.filter((s) => monthKey(s.stat_date) === previousMonth) : []
  const lastMonthRows = lastMonthFull.slice(0, thisMonthRows.length)

  const sum = (rows: typeof stats, key: 'views' | 'watch_time_minutes' | 'subscribers_gained') =>
    rows.reduce((acc, r) => acc + r[key], 0)

  const thisViews = sum(thisMonthRows, 'views')
  const lastViews = sum(lastMonthRows, 'views')
  const thisWatchMinutes = sum(thisMonthRows, 'watch_time_minutes')
  const lastWatchMinutes = sum(lastMonthRows, 'watch_time_minutes')
  const thisSubsGained = sum(thisMonthRows, 'subscribers_gained')
  const lastSubsGained = sum(lastMonthRows, 'subscribers_gained')
  const subscribersTotal = stats[stats.length - 1].subscribers_total

  const viewsDelta = pctDelta(thisViews, lastViews)
  const watchDelta = pctDelta(thisWatchMinutes, lastWatchMinutes)
  const subsDelta = pctDelta(thisSubsGained, lastSubsGained)

  const metrics: Metric[] = [
    {
      label: 'Views',
      value: formatCompact(thisViews),
      delta: viewsDelta === null ? null : { pct: viewsDelta, positive: viewsDelta >= 0 },
    },
    {
      label: 'Watch time',
      value: `${formatCompact(thisWatchMinutes / 60)} hrs`,
      delta: watchDelta === null ? null : { pct: watchDelta, positive: watchDelta >= 0 },
    },
    {
      label: 'Subscribers',
      value: formatCompact(subscribersTotal),
      hint: `+${formatCompact(thisSubsGained)} this month`,
      delta: subsDelta === null ? null : { pct: subsDelta, positive: subsDelta >= 0 },
    },
  ]

  const last30 = stats.slice(-30)
  const trendPoints: TrendPoint[] = last30.map((s) => ({
    label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(s.stat_date + 'T00:00:00Z')),
    value: s.views,
  }))

  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5)

  // Real linkage between Analytics and Deals — the same account's pipeline,
  // for the same month this page is already showing performance for. Only
  // rendered when there's at least one deal the caller's role can see (RLS
  // already returns an empty list for a role without Deals access, so this
  // naturally disappears for Editor/Designer rather than showing an
  // access-denied panel).
  const dealsThisMonth = deals.filter((d) => d.created_at.slice(0, 7) === currentMonth)
  const dealsThisMonthValue = dealsThisMonth.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0)

  return (
    <>
      <DashboardHeader
        eyebrow="Analytics"
        title="Analytics"
        description="Your YouTube channel performance"
        right={
          <span className="rounded-[9999px] border border-white/10 px-3 py-1.5 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-zinc-400">
            This month
          </span>
        }
      />

      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <MetricGrid metrics={metrics} />

          <Panel title="Views, last 30 days" titleId="trend-h">
            <div className="px-5 pb-5">
              <LineTrendChart points={trendPoints} unit="views" />
            </div>
          </Panel>

          <Panel title="Top videos" titleId="videos-h">
            {topVideos.length === 0 ? (
              <p className="px-5 pb-5 font-nebula-ui text-[12.5px] text-zinc-500">No video data yet.</p>
            ) : (
              <ul className="pb-2">
                {topVideos.map((v, i) => (
                  <li
                    key={v.id}
                    className="flex items-center gap-4 border-t border-white/[0.05] px-5 py-3 first:border-t-0"
                  >
                    <span className="w-4 shrink-0 font-nebula-mono text-[11px] text-zinc-600">{i + 1}</span>
                    <p className="min-w-0 flex-1 truncate font-nebula-ui text-[13px] font-medium text-zinc-200">
                      {v.title}
                    </p>
                    <span className="shrink-0 font-nebula-mono text-[12px] text-zinc-500">
                      {formatCompact(v.views)} views
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {deals.length > 0 && (
            <Panel
              title="Deal pipeline this month"
              titleId="deals-link-h"
              action={{ label: 'Open Deals', href: '/deals' }}
            >
              <div className="px-5 py-4">
                <p className="font-nebula-heading text-[20px] font-semibold text-white">{formatMoney(dealsThisMonthValue)}</p>
                <p className="font-nebula-ui text-[12.5px] text-zinc-500">
                  {dealsThisMonth.length === 0
                    ? 'No new deals this month yet.'
                    : `${dealsThisMonth.length} new ${dealsThisMonth.length === 1 ? 'deal' : 'deals'} started this month`}
                </p>
              </div>
            </Panel>
          )}

          {youtube?.isDemo && (
            <p className="text-center font-nebula-ui text-[11px] text-zinc-600">
              Showing seeded demo performance data for this account. In production, this pulls live from the YouTube
              Analytics API for a connected channel.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
