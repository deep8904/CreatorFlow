'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

type Range = 'This month' | 'Last month' | 'Last 3 months'

const topVideos = [
  { title: '5 tools I use to manage $50K in brand deals', views: '84,200', watchTime: '3,210h', subs: '+820' },
  { title: 'What YouTube really pays per 1000 views', views: '61,400', watchTime: '2,480h', subs: '+610' },
  { title: 'I pitched 20 brands in 30 days — here\'s what happened', views: '47,100', watchTime: '1,940h', subs: '+390' },
  { title: 'My full brand deal workflow (contract to cash)', views: '38,800', watchTime: '1,650h', subs: '+290' },
  { title: 'Stop making these 5 YouTube mistakes', views: '29,300', watchTime: '1,200h', subs: '+180' },
]

const barData: Record<Range, number[]> = {
  'This month':    [52, 68, 61, 75, 82, 70, 90, 78, 64, 86, 72, 94, 80, 66, 77, 88, 60, 73, 85, 69, 92, 58, 76, 84, 70, 63, 87, 79, 65, 91],
  'Last month':    [45, 60, 55, 70, 65, 75, 80, 62, 68, 74, 58, 72, 80, 66, 71, 84, 59, 68, 78, 64, 87, 54, 70, 79, 65, 58, 82, 74, 60, 85],
  'Last 3 months': [40, 55, 50, 62, 58, 68, 72, 56, 63, 67, 52, 65, 75, 60, 64, 78, 54, 62, 72, 59, 80, 50, 64, 73, 59, 54, 76, 68, 55, 78],
}

const metrics: Record<Range, { views: string; viewsDelta: string; watchTime: string; watchDelta: string; subs: string; subsDelta: string }> = {
  'This month':    { views: '142,300', viewsDelta: '+14.2%', watchTime: '5,840h', watchDelta: '+9.1%', subs: '+2,140', subsDelta: '+6.3%' },
  'Last month':    { views: '124,600', viewsDelta: '+8.7%',  watchTime: '5,350h', watchDelta: '+5.2%', subs: '+1,820', subsDelta: '+4.1%' },
  'Last 3 months': { views: '391,200', viewsDelta: '+11.3%', watchTime: '16,200h', watchDelta: '+7.8%', subs: '+6,200', subsDelta: '+5.4%' },
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('This month')
  const m = metrics[range]
  const bars = barData[range]
  const maxBar = Math.max(...bars)

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="max-w-[960px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Analytics</h1>
            <p className="text-[12.5px] text-ash mt-0.5">Your YouTube channel performance</p>
          </div>
          {/* Range toggle */}
          <div className="flex items-center bg-paper-white border border-fog rounded-full p-1 gap-0.5">
            {(['This month', 'Last month', 'Last 3 months'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${
                  range === r
                    ? 'bg-linen text-carbon shadow-[rgba(0,0,0,0.06)_0px_1px_2px_0px]'
                    : 'text-ash hover:text-carbon'
                }`}
                style={{ letterSpacing: '-0.25px' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total views', value: m.views, delta: m.viewsDelta, accent: 'text-lavender' },
            { label: 'Watch time', value: m.watchTime, delta: m.watchDelta, accent: 'text-sky' },
            { label: 'New subscribers', value: m.subs, delta: m.subsDelta, accent: 'text-mint' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-paper-white border border-fog rounded-2xl px-5 py-5"
              style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}
            >
              <p className="text-[12px] font-medium text-ash mb-3">{stat.label}</p>
              <p
                className="font-bold text-carbon mb-1.5"
                style={{ fontSize: '24px', lineHeight: 1, letterSpacing: '-0.04em' }}
              >
                {stat.value}
              </p>
              <p className={`text-[12.5px] font-semibold ${stat.accent} flex items-center gap-1`}>
                <TrendingUp size={11} strokeWidth={2.5} /> {stat.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div
          className="bg-paper-white border border-fog rounded-2xl p-6 mb-5"
          style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
              Daily views
            </h2>
            <span className="text-[12px] text-ash">{range}</span>
          </div>
          <div className="flex items-end gap-[3px]" style={{ height: '120px' }}>
            {bars.map((val, i) => {
              const heightPct = (val / maxBar) * 100
              const isHighlight = val === maxBar
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-[3px] transition-all cursor-default"
                  style={{
                    height: `${heightPct}%`,
                    background: isHighlight ? '#918df6' : '#e8e8e8',
                    minHeight: '4px',
                  }}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2.5">
            {[1, Math.round(bars.length / 4), Math.round(bars.length / 2), Math.round((3 * bars.length) / 4), bars.length].map((d) => (
              <span key={d} className="text-[10.5px] text-ash">{d}</span>
            ))}
          </div>
        </div>

        {/* Top videos */}
        <div
          className="bg-paper-white border border-fog rounded-2xl overflow-hidden"
          style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}
        >
          <div className="px-5 py-4 border-b border-fog">
            <h2 className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
              Top videos
            </h2>
          </div>
          <div>
            {topVideos.map((video, i) => (
              <div
                key={video.title}
                className={`px-5 py-4 flex items-center gap-4 ${i < topVideos.length - 1 ? 'border-b border-fog' : ''}`}
              >
                <span className="text-[13px] font-bold text-ash w-5 shrink-0">{i + 1}</span>
                <p
                  className="text-[13.5px] font-medium text-carbon flex-1 leading-snug"
                  style={{ letterSpacing: '-0.25px' }}
                >
                  {video.title}
                </p>
                <div className="flex gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] text-ash mb-0.5">Views</p>
                    <p className="text-[13px] font-semibold text-carbon">{video.views}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] text-ash mb-0.5">Watch time</p>
                    <p className="text-[13px] font-semibold text-carbon">{video.watchTime}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-[11px] text-ash mb-0.5">Subscribers</p>
                    <p className="text-[13px] font-semibold text-mint">{video.subs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
