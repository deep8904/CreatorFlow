import { NebulaReveal } from './NebulaReveal'

/**
 * The giant ghost-typography section, from the reference's "MOBILE SUITE"
 * block (docs/NEBULA_REFERENCE_NOTES.md §5): a `12vw` headline at
 * `text-white/[0.03]` sitting behind the real content, plus the `02/04`
 * section counter.
 *
 * The phone frame shows CreatorFlow's *responsive web* app on a handset —
 * docs/PRD.md lists native mobile as an explicit non-goal, so this is
 * deliberately not dressed up as an App Store product.
 */

const TIMEFRAMES = ['1W', '1M', '3M', '1Y'] as const

export function GhostSection() {
  return (
    <section className="relative z-20 mx-auto mb-32 w-full max-w-7xl overflow-hidden py-20">
      {/* Ghost headline */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-full -translate-x-1/2 -translate-y-1/2 select-none">
        <p className="whitespace-nowrap text-center font-nebula-heading text-[12vw] font-bold leading-none tracking-tighter text-white/[0.03]">
          ON EVERY SCREEN
        </p>
      </div>

      <div className="relative z-10 grid items-center gap-8 px-6 lg:grid-cols-12">
        {/* Left — copy */}
        <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-4">
          <div className="mb-6 flex items-center gap-2 opacity-60">
            <span aria-hidden className="h-2 w-2 rounded-[9999px] bg-orange-500" />
            <span className="font-nebula-mono text-xs tracking-widest text-gray-400">02/03</span>
          </div>

          <h2 className="mb-8 font-nebula-heading text-4xl font-normal uppercase leading-[1.1] tracking-tight text-white md:text-6xl">
            Check a deal
            <span className="text-gray-500"> from</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">
              {' '}
              anywhere
            </span>
          </h2>

          <p className="font-nebula-ui text-lg leading-relaxed text-gray-400">
            The same pipeline, ideas and analytics on a phone as on your desk. Responsive web — no
            app to install, nothing extra to keep updated.
          </p>

          <div aria-hidden className="mt-8 hidden h-px w-24 bg-white/10 lg:block" />
        </div>

        {/* Centre — phone */}
        <div className="relative order-1 flex justify-center py-12 lg:order-2 lg:col-span-4 lg:py-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-64 -translate-x-1/2 -translate-y-1/2 rounded-[9999px] bg-orange-500/20 blur-[100px]"
          />

          {/* 6-stop layered shadow is what makes the frame read as a real object */}
          <div className="relative z-10 h-[600px] w-[276px] overflow-hidden rounded-[3rem] border border-zinc-800 sm:h-[660px] sm:w-[330px] sm:rounded-[3.5rem] bg-zinc-950 ring-1 ring-white/10 shadow-[0_5.7px_8.6px_rgba(0,0,0,0.07),0_13.7px_10.9px_rgba(0,0,0,0.099),0_25.7px_20.5px_rgba(0,0,0,0.123),0_45.8px_36.6px_rgba(0,0,0,0.147),0_85.8px_68.5px_rgba(0,0,0,0.176),0_205px_163.4px_rgba(0,0,0,0.246)]">
            {/* Dynamic Island — expands on hover, as in the reference */}
            <div className="group/island absolute left-1/2 top-3 z-50 flex h-[32px] w-[110px] -translate-x-1/2 items-center justify-between rounded-[9999px] bg-black px-3 transition-all duration-500 hover:w-[140px] hover:shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <div className="flex h-full items-center gap-2 opacity-0 transition-opacity delay-100 duration-300 group-hover/island:opacity-100">
                <div className="h-1 w-1 animate-pulse rounded-[9999px] bg-orange-500/80 shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
              </div>
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1.5">
                <div className="h-4 w-4 rounded-[9999px] border border-white/5 bg-zinc-900/80 backdrop-blur-md" />
              </div>
              <div className="ml-auto flex h-full items-center gap-2 opacity-0 transition-opacity delay-100 duration-300 group-hover/island:opacity-100">
                <div className="h-1 w-1 rounded-[9999px] bg-emerald-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              </div>
            </div>

            {/* Status bar */}
            <div className="absolute left-0 top-4 z-40 flex w-full items-center justify-between px-8 font-nebula-tech text-[10px] font-semibold tracking-wide text-white/90">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                {[3, 5, 7, 9].map((h) => (
                  <span key={h} className="w-0.5 rounded-sm bg-white/80" style={{ height: `${h}px` }} />
                ))}
                <span className="ml-1 h-2.5 w-5 rounded-[3px] border border-white/50 p-[1px]">
                  <span className="block h-full w-3/4 rounded-[1px] bg-white/80" />
                </span>
              </div>
            </div>

            {/* App content */}
            <div className="relative z-10 flex h-full w-full flex-col bg-gradient-to-b from-zinc-900 to-black px-6 pt-16">
              <div className="relative z-10 mb-8 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-[9999px] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 text-white/70 backdrop-blur-sm">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-[9999px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="font-nebula-ui text-sm font-semibold tracking-wide text-white">
                    Pipeline
                  </span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-[9999px] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 text-white/70 backdrop-blur-sm">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </div>
              </div>

              <div className="mb-4 text-center">
                <p className="mb-2 font-nebula-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Pipeline value
                </p>
                <p className="font-nebula-tech text-5xl font-medium tracking-tighter text-white">
                  $23,250
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className="flex items-center rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-nebula-tech text-[10px] font-semibold text-emerald-500">
                    <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                    17 active
                  </span>
                  <span className="font-nebula-ui text-xs font-medium text-zinc-500">this month</span>
                </div>
              </div>

              {/* SVG area chart with dashed grid, per the reference */}
              <div className="relative mb-6 h-40 w-full">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 280 120" preserveAspectRatio="none" role="img" aria-label="Pipeline value trending upward over the last month">
                  <defs>
                    <pattern id="cfPhoneGrid" width="40" height="120" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="120" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
                    </pattern>
                    <linearGradient id="cfPhoneArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cfPhoneGrid)" />
                  <line x1="0" y1="120" x2="280" y2="120" stroke="#3f3f46" strokeWidth="1" opacity="0.5" />
                  <path d="M0,80 C20,80 30,60 50,65 C70,70 80,90 100,85 C120,80 130,40 150,45 C170,50 180,70 200,60 C220,50 230,20 250,25 C265,28 275,10 280,15 V120 H0 Z" fill="url(#cfPhoneArea)" />
                  <path d="M0,80 C20,80 30,60 50,65 C70,70 80,90 100,85 C120,80 130,40 150,45 C170,50 180,70 200,60 C220,50 230,20 250,25 C265,28 275,10 280,15" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <g transform="translate(150, 45)">
                    <circle r="4" fill="#18181b" stroke="#f97316" strokeWidth="2" className="animate-pulse" />
                    <line x1="0" y1="4" x2="0" y2="75" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                  </g>
                </svg>

                <div className="flex justify-between px-2 pt-2">
                  {TIMEFRAMES.map((tf) => (
                    <span
                      key={tf}
                      className={
                        tf === '1M'
                          ? 'rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-nebula-tech text-[9px] font-semibold text-orange-500'
                          : 'font-nebula-tech text-[9px] font-semibold text-zinc-600'
                      }
                    >
                      {tf}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom sheet */}
              <div className="-mx-6 flex-1 rounded-t-[2rem] border-t border-white/5 bg-zinc-900/60 px-6 pb-4 pt-6 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-nebula-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Needs attention
                  </p>
                  <div className="flex gap-1">
                    <span className="h-1 w-1 rounded-[9999px] bg-zinc-600" />
                    <span className="h-1 w-1 rounded-[9999px] bg-zinc-700" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { brand: 'Aura Skincare', state: 'Awaiting reply', tone: 'text-orange-400', dot: 'bg-orange-400 animate-pulse' },
                    { brand: 'Verve Energy', state: 'Contract sent', tone: 'text-emerald-500', dot: 'bg-emerald-500' },
                  ].map((row) => (
                    <div
                      key={row.brand}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[9999px] border border-orange-500/20 bg-orange-500/20 font-nebula-mono text-[10px] font-semibold text-orange-300">
                          {row.brand.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-nebula-ui text-xs font-semibold text-white">{row.brand}</span>
                          <span className={`flex items-center gap-1 font-nebula-ui text-[10px] font-medium ${row.tone}`}>
                            <span className={`h-1 w-1 rounded-[9999px] ${row.dot}`} /> {row.state}
                          </span>
                        </div>
                      </div>
                      <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-nebula-mono text-[9px] leading-relaxed text-zinc-600">
                  Demonstration data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — supporting stat cards */}
        <div className="relative z-10 order-3 flex w-full flex-col items-stretch justify-center gap-5 sm:flex-row sm:items-stretch lg:col-span-4 lg:flex-col lg:items-end">
          <div
            className="nebula-border relative w-full rounded-3xl bg-gradient-to-br from-white/10 to-white/0 p-5 text-left shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:scale-[1.01] lg:max-w-sm"
            style={{
              ['--nebula-border-gradient' as string]:
                'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0), rgba(255,255,255,0.05))',
            }}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-[9999px] bg-gradient-to-br from-orange-500 to-orange-600 p-0.5 shadow-lg shadow-orange-500/20">
                <div className="flex h-full w-full items-center justify-center rounded-[9999px] bg-black font-nebula-heading text-sm font-bold text-white">
                  F
                </div>
              </div>
              <div>
                <p className="font-nebula-ui text-sm font-semibold text-white">Your workspace</p>
                <p className="font-nebula-mono text-[11px] text-zinc-500">free · open source</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Deals', value: '17' },
                { label: 'Ideas', value: '13' },
                { label: 'Drafts', value: '7' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="font-nebula-tech text-xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 font-nebula-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <NebulaReveal delay={200} className="w-full lg:max-w-sm">
            <div
              className="nebula-border relative h-full rounded-3xl bg-gradient-to-br from-white/10 to-white/0 p-5 backdrop-blur-xl"
              style={{
                ['--nebula-border-gradient' as string]:
                  'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0), rgba(255,255,255,0.05))',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-[9999px] bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-[9999px] bg-emerald-500" />
                </span>
                {/* Typewriter, per the reference's API-status card */}
                <p className="nebula-typewriter font-nebula-mono text-xs tracking-wide text-emerald-500">
                  Synced · nothing overdue
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-nebula-mono text-[11px] text-zinc-500">Gmail classify</span>
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-[9999px] bg-orange-400 [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-[9999px] bg-orange-400 [animation-delay:100ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-[9999px] bg-orange-400 [animation-delay:200ms]" />
                </span>
                <span className="ml-auto flex gap-0.5" aria-hidden>
                  <span className="h-3 w-1 rounded-[9999px] bg-emerald-500" />
                  <span className="h-3 w-1 rounded-[9999px] bg-emerald-500/50" />
                  <span className="h-3 w-1 rounded-[9999px] bg-emerald-500/20" />
                </span>
              </div>
            </div>
          </NebulaReveal>
        </div>
      </div>
    </section>
  )
}
