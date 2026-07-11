import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, TrendingUp, DollarSign, Lightbulb, Eye, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard — CreatorFlow' }

const stats = [
  { label: 'Open Deals', value: '8', delta: '+3 this week', positive: true, icon: ArrowUpRight, accent: 'bg-sky/10 text-sky' },
  { label: 'Revenue MTD', value: '$12,400', delta: '+18%', positive: true, icon: DollarSign, accent: 'bg-mint-wash text-mint' },
  { label: 'Ideas Captured', value: '24', delta: '5 in progress', positive: true, icon: Lightbulb, accent: 'bg-amber/10 text-amber' },
  { label: 'Channel Views', value: '142K', delta: '+8.4%', positive: true, icon: Eye, accent: 'bg-lavender/10 text-lavender' },
]

const attention = [
  { brand: 'NordVPN', action: 'Reply needed', time: '2 days ago', stage: 'Inbound', chip: 'bg-sky/10 text-sky', initials: 'NV' },
  { brand: 'Squarespace', action: 'Contract review', time: '1 day ago', stage: 'Negotiating', chip: 'bg-amber/10 text-amber', initials: 'SS' },
  { brand: 'Skillshare', action: 'Invoice pending', time: '5 days ago', stage: 'Delivered', chip: 'bg-lavender/10 text-lavender', initials: 'SK' },
]

const recentIdeas = [
  { title: '5 tools I actually use to manage brand deals', status: 'In Progress', chip: 'bg-sky/10 text-sky' },
  { title: 'What YouTube actually pays per 1K views in 2025', status: 'New', chip: 'bg-fog text-graphite' },
  { title: 'My complete brand deal workflow ($0 to $10K/mo)', status: 'Scheduled', chip: 'bg-mint-wash text-mint' },
]

const weeklyBars = [42, 61, 55, 80, 74, 93, 68]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="max-w-[1100px] mx-auto px-8 py-8">

        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[12.5px] font-medium text-ash mb-0.5" style={{ letterSpacing: '-0.2px' }}>
              Good morning
            </p>
            <h1
              className="font-bold text-carbon"
              style={{ fontSize: '22px', lineHeight: 1.25, letterSpacing: '-0.04em' }}
            >
              Jane Doe
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

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-paper-white border border-fog rounded-2xl p-5"
              style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 3px 0px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-medium text-ash" style={{ letterSpacing: '-0.2px' }}>
                  {s.label}
                </p>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-semibold ${s.accent}`}>
                  <s.icon size={11} strokeWidth={2.2} />
                </span>
              </div>
              <p
                className="font-bold text-carbon mb-1"
                style={{ fontSize: '22px', lineHeight: 1, letterSpacing: '-0.04em' }}
              >
                {s.value}
              </p>
              <p className={`text-[11.5px] font-medium ${s.positive ? 'text-mint' : 'text-ember'}`}>
                {s.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Needs attention — 2 cols */}
          <div
            className="lg:col-span-2 bg-paper-white border border-fog rounded-2xl overflow-hidden"
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
            <div>
              {attention.map((item, i) => (
                <Link
                  key={item.brand}
                  href="/deals"
                  className={`flex items-center justify-between px-5 py-4 hover:bg-linen transition-colors ${i < attention.length - 1 ? 'border-b border-fog' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-lavender/10 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-lavender">{item.initials}</span>
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                        {item.brand}
                      </p>
                      <p className="text-[12px] text-ash">{item.action} · {item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${item.chip}`}>
                      {item.stage}
                    </span>
                    <ArrowRight size={13} className="text-fog" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions — 1 col */}
          <div
            className="bg-paper-white border border-fog rounded-2xl overflow-hidden"
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
                { label: 'Capture an idea', href: '/ideas', accent: 'bg-amber/10 text-amber' },
                { label: 'Start a draft', href: '/drafts', accent: 'bg-sky/10 text-sky' },
                { label: 'View analytics', href: '/analytics', accent: 'bg-mint-wash text-mint' },
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
            className="bg-paper-white border border-fog rounded-2xl overflow-hidden"
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
            <div>
              {recentIdeas.map((idea, i) => (
                <Link
                  key={idea.title}
                  href="/ideas"
                  className={`flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-linen transition-colors ${i < recentIdeas.length - 1 ? 'border-b border-fog' : ''}`}
                >
                  <p className="text-[13px] font-medium text-carbon flex-1 leading-snug" style={{ letterSpacing: '-0.25px' }}>
                    {idea.title}
                  </p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${idea.chip}`}>
                    {idea.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Weekly performance chart */}
          <div
            className="lg:col-span-2 bg-paper-white border border-fog rounded-2xl overflow-hidden"
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
            <div className="px-5 pt-4 pb-5">
              {/* Mini metrics */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Views', value: '38.2K', delta: '+12%' },
                  { label: 'Watch time', value: '1,840h', delta: '+8%' },
                  { label: 'New subscribers', value: '+1,240', delta: '+5%' },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-[11px] text-ash mb-0.5">{m.label}</p>
                    <p
                      className="font-bold text-carbon"
                      style={{ fontSize: '18px', lineHeight: 1.1, letterSpacing: '-0.04em' }}
                    >
                      {m.value}
                    </p>
                    <p className="text-[11.5px] font-semibold text-mint mt-0.5 flex items-center gap-0.5">
                      <TrendingUp size={10} /> {m.delta}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <p className="text-[11px] text-ash mb-2.5">Daily views — last 7 days</p>
              <div className="flex items-end gap-1.5 h-14">
                {weeklyBars.map((pct, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[5px] transition-colors"
                    style={{
                      height: `${pct}%`,
                      background: i === 5 ? '#918df6' : '#e8e8e8',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {days.map((d, i) => (
                  <span
                    key={d}
                    className="flex-1 text-center text-[10.5px]"
                    style={{ color: i === 5 ? '#918df6' : '#999999', fontWeight: i === 5 ? 600 : 400 }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
