import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-paper-white pt-16 pb-0 px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">

        {/* Top announcement chip */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2 bg-paper-white border border-fog rounded-full px-3.5 py-1.5"
            style={{ boxShadow: 'rgba(0,0,0,0.06) 0px 1px 4px 0px' }}
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky text-paper-white">
              <Zap size={9} fill="currentColor" />
            </span>
            <span className="text-[13px] font-medium text-carbon" style={{ letterSpacing: '-0.2px' }}>
              Free means free — no cut from your deals, ever
            </span>
            <ArrowRight size={13} className="text-ash" />
          </div>
        </div>

        {/* Main headline block */}
        <div className="text-center max-w-[800px] mx-auto mb-8">
          <h1
            className="font-bold text-carbon text-balance"
            style={{
              fontSize: 'clamp(40px, 5.5vw, 64px)',
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
            }}
          >
            Run your creator business
            <br />
            <span className="text-lavender">without the chaos.</span>
          </h1>
          <p
            className="text-graphite mt-5 max-w-[560px] mx-auto"
            style={{ fontSize: '17px', lineHeight: 1.6, letterSpacing: '-0.3px' }}
          >
            Track brand deals from first email to paid invoice. Capture ideas before they slip. See what&apos;s working — free, forever, no percentage taken.
          </p>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-paper-white bg-lavender px-6 py-3 rounded-full transition-opacity hover:opacity-90"
            style={{
              letterSpacing: '-0.25px',
              boxShadow: 'rgba(145,141,246,0.35) 0px 4px 16px 0px, rgba(0,0,0,0.08) 0px 1px 2px 0px',
            }}
          >
            Start free
            <ArrowRight size={14} />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-graphite hover:text-carbon transition-colors px-4 py-3"
            style={{ letterSpacing: '-0.25px' }}
          >
            See how it works
          </Link>
        </div>

        <p className="text-center text-[12.5px] text-ash mb-12" style={{ letterSpacing: '-0.2px' }}>
          No credit card. No deal cut. Connects in 2 minutes.
        </p>

        {/* Hero product mockup — full-bleed gradient band with floating dashboard */}
        <div
          className="relative rounded-t-[20px] overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #2c78fc 0%, #918df6 55%, #b8a6ff 100%)' }}
        >
          {/* Subtle noise / texture overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

          <div className="relative px-8 pt-10 pb-0">
            {/* Floating dashboard card */}
            <div
              className="bg-paper-white rounded-[16px] border border-fog overflow-hidden"
              style={{ boxShadow: 'rgba(0,0,0,0.18) 0px 8px 40px 0px, rgba(0,0,0,0.06) 0px 1px 3px 0px' }}
            >
              {/* App top bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-fog bg-linen">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-ember/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-mint/60" />
                </div>
                <div className="flex items-center gap-2 bg-fog/50 rounded-full px-3 py-1">
                  <div className="w-2 h-2 rounded-full bg-ash/40" />
                  <span className="text-[11px] text-ash font-medium">app.creatorflow.io</span>
                </div>
                <div className="w-16" />
              </div>

              <div className="flex">
                {/* Mini sidebar */}
                <div className="w-44 border-r border-fog bg-linen shrink-0 p-3 hidden sm:block">
                  <div className="flex items-center gap-2 px-2 py-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-lavender flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5h6M4.5 1.5l3 3-3 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-[11px] font-semibold text-carbon">CreatorFlow</span>
                  </div>
                  {['Dashboard','Deals','Ideas','Drafts','Analytics'].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 ${i === 0 ? 'bg-paper-white text-carbon' : 'text-graphite'}`}
                    >
                      <div className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-lavender/20' : 'bg-fog'}`} />
                      <span className="text-[11px] font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5 bg-paper-white">
                  <p className="text-[11px] font-medium text-ash mb-1" style={{ letterSpacing: '-0.2px' }}>Good morning, Jane</p>
                  <p className="text-[15px] font-semibold text-carbon mb-4" style={{ letterSpacing: '-0.4px' }}>What needs your attention today</p>

                  {/* Stat row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                    {[
                      { label: 'Open Deals', value: '8', delta: '+3 this week', color: 'text-mint' },
                      { label: 'Revenue MTD', value: '$12.4K', delta: '+18%', color: 'text-mint' },
                      { label: 'Ideas', value: '24', delta: '5 in progress', color: 'text-sky' },
                      { label: 'Views', value: '142K', delta: '+8.4%', color: 'text-mint' },
                    ].map((s) => (
                      <div key={s.label} className="bg-linen border border-fog rounded-xl p-3">
                        <p className="text-[10px] text-ash font-medium mb-1">{s.label}</p>
                        <p className="text-[16px] font-bold text-carbon leading-none mb-0.5" style={{ letterSpacing: '-0.4px' }}>{s.value}</p>
                        <p className={`text-[10px] font-medium ${s.color}`}>{s.delta}</p>
                      </div>
                    ))}
                  </div>

                  {/* Deal pipeline strip */}
                  <div className="bg-linen border border-fog rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-semibold text-carbon">Deal Pipeline</span>
                      <span className="text-[10px] text-ash">8 active</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[
                        { stage: 'Inbound', count: 3, chip: 'bg-sky/10 text-sky' },
                        { stage: 'Negotiating', count: 2, chip: 'bg-amber/10 text-amber' },
                        { stage: 'Contracted', count: 1, chip: 'bg-lavender/10 text-lavender' },
                        { stage: 'Delivered', count: 1, chip: 'bg-mint-wash text-mint' },
                        { stage: 'Paid', count: 1, chip: 'bg-mint-wash text-mint' },
                      ].map((col) => (
                        <div key={col.stage} className="flex-1">
                          <div className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold mb-1.5 inline-block ${col.chip}`}>
                            {col.stage} {col.count}
                          </div>
                          {Array.from({ length: col.count }).map((_, j) => (
                            <div key={j} className="bg-paper-white border border-fog rounded-lg p-1.5 mb-1">
                              <div className="h-1.5 bg-fog rounded-full w-3/4 mb-1" />
                              <div className="h-1.5 bg-fog rounded-full w-1/2" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
