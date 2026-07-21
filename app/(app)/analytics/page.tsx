import type { Metadata } from 'next'
import { BarChart2, TrendingDown, TrendingUp } from 'lucide-react'
import { getChannelStats, getChannelVideos, getIntegrations } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata: Metadata = { title: 'Analytics — CreatorFlow' }

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7) // YYYY-MM
}

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export default async function AnalyticsPage() {
  const [integrations, stats, videos] = await Promise.all([
    getIntegrations(),
    getChannelStats(120),
    getChannelVideos(),
  ])
  const youtubeConnected = integrations.some((i) => i.provider === 'youtube')

  if (!youtubeConnected || stats.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-linen">
        <div className="app-container">
          <div className="mb-8">
            <h1 className="text-app-h1 text-carbon">Analytics</h1>
            <p className="text-[12.5px] text-ash mt-0.5">Your YouTube channel performance</p>
          </div>
          <div className="py-10">
            <EmptyState
              icon={<BarChart2 size={18} className="text-ash" strokeWidth={2} />}
              title="Connect YouTube to see your performance here."
              action={
                <Button href="/settings" size="md">
                  Connect YouTube
                </Button>
              }
            />
          </div>
        </div>
      </main>
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

  const cards = [
    { label: 'Views', value: formatCompact(thisViews), delta: pctDelta(thisViews, lastViews) },
    { label: 'Watch time', value: `${formatCompact(thisWatchMinutes / 60)} hrs`, delta: pctDelta(thisWatchMinutes, lastWatchMinutes) },
    { label: 'Subscribers', value: formatCompact(subscribersTotal), delta: pctDelta(thisSubsGained, lastSubsGained), sublabel: `+${formatCompact(thisSubsGained)} this month` },
  ]

  const last30 = stats.slice(-30)
  const maxViews = Math.max(...last30.map((d) => d.views), 1)

  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-app-h1 text-carbon">Analytics</h1>
            <p className="text-[12.5px] text-ash mt-0.5">Your YouTube channel performance</p>
          </div>
          <span className="font-label text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-lavender/10 text-lavender">This month</span>
        </div>

        {/* Stat cards — number + a small delta badge in the corner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {cards.map((c) => (
            <div key={c.label} className="relative bg-paper-white border border-fog rounded-xl p-5" style={{ boxShadow: 'var(--shadow-subtle)' }}>
              {c.delta !== null && (
                <div className={`absolute top-4 right-4 flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.delta >= 0 ? 'bg-lavender/10 text-lavender' : 'bg-fog text-graphite'}`}>
                  {c.delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(c.delta).toFixed(1)}%
                </div>
              )}
              <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-3">{c.label}</p>
              <p className="font-bold text-carbon mb-1" style={{ fontSize: '22px', lineHeight: 1, letterSpacing: '-0.04em' }}>{c.value}</p>
              {c.sublabel && <p className="text-[11.5px] font-medium text-ash">{c.sublabel}</p>}
            </div>
          ))}
        </div>

        {/* Trend */}
        <div className="bg-paper-white border border-fog rounded-xl overflow-hidden mb-6" style={{ boxShadow: 'var(--shadow-subtle)' }}>
          <div className="px-5 py-4 border-b border-fog">
            <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>Views, last 30 days</h2>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-1 h-[110px]">
              {last30.map((d) => (
                <div
                  key={d.stat_date}
                  className="flex-1 rounded-t bg-lavender/25 hover:bg-lavender/50 transition-colors"
                  style={{ height: `${Math.max(4, (d.views / maxViews) * 100)}%` }}
                  title={`${d.stat_date}: ${d.views.toLocaleString()} views`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top videos */}
        <div className="bg-paper-white border border-fog rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-subtle)' }}>
          <div className="px-5 py-4 border-b border-fog">
            <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>Top videos</h2>
          </div>
          <div>
            {topVideos.map((v, i) => (
              <div key={v.id} className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i < topVideos.length - 1 ? 'border-b border-fog' : ''}`}>
                <p className="text-[13px] font-medium text-carbon flex-1 leading-snug" style={{ letterSpacing: '-0.25px' }}>{v.title}</p>
                <span className="text-[12px] text-ash shrink-0">{formatCompact(v.views)} views</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-ash mt-6 text-center">
          Showing seeded demo performance data for this account. In production, this pulls live from the YouTube Analytics API for a connected channel.
        </p>
      </div>
    </main>
  )
}
