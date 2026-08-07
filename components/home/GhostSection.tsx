import { NebulaReveal } from './NebulaReveal'

/**
 * The giant ghost-typography section, from the reference's "MOBILE SUITE"
 * block (docs/NEBULA_REFERENCE_NOTES.md §5): a `12vw` headline at
 * `text-white/[0.03]` sitting behind the real content, plus the `02/04`
 * section counter.
 *
 * The centrepiece is a browser-window mockup around a real screenshot of
 * the live Dashboard (public/home/dashboard-screenshot.jpg) rather than an
 * illustrated approximation — this is the one place on the page that shows
 * the actual product instead of a stylised stand-in.
 */

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
        <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-3">
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
            The same pipeline, ideas and analytics on a phone as on your desk. Responsive web, no
            app to install, nothing extra to keep updated.
          </p>

          <div aria-hidden className="mt-8 hidden h-px w-24 bg-white/10 lg:block" />
        </div>

        {/* Centre — desktop */}
        <div className="relative order-1 flex justify-center py-12 lg:order-2 lg:col-span-6 lg:py-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-[9999px] bg-orange-500/20 blur-[100px]"
          />

          {/* Same 6-stop layered shadow the phone frame used to carry, so the
              window still reads as a real object floating in the scene. */}
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 ring-1 ring-white/10 shadow-[0_5.7px_8.6px_rgba(0,0,0,0.07),0_13.7px_10.9px_rgba(0,0,0,0.099),0_25.7px_20.5px_rgba(0,0,0,0.123),0_45.8px_36.6px_rgba(0,0,0,0.147),0_85.8px_68.5px_rgba(0,0,0,0.176),0_205px_163.4px_rgba(0,0,0,0.246)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-4 border-b border-white/5 bg-zinc-900/80 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="h-2.5 w-2.5 rounded-[9999px] bg-[#ff5f57]" />
                <span aria-hidden className="h-2.5 w-2.5 rounded-[9999px] bg-[#febc2e]" />
                <span aria-hidden className="h-2.5 w-2.5 rounded-[9999px] bg-[#28c840]" />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center gap-1.5 rounded-[9999px] bg-white/5 px-4 py-1 font-nebula-mono text-[10px] text-zinc-500">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="10" x="5" y="11" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  creatorflow.app/dashboard
                </div>
              </div>
            </div>

            {/* Real dashboard screenshot — padded on all sides so it reads as
                content sitting inside the browser chrome, not a flush crop. */}
            <div className="bg-zinc-950 p-3">
              <img
                src="/home/dashboard-screenshot.jpg"
                alt="The CreatorFlow dashboard showing pipeline value, open deals, and channel view trends"
                width={1600}
                height={1000}
                loading="lazy"
                className="block w-full rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Right — supporting stat cards */}
        <div className="relative z-10 order-3 flex w-full flex-col items-stretch justify-center gap-5 sm:flex-row sm:items-stretch lg:col-span-3 lg:flex-col lg:items-end">
          <div
            className="nebula-border relative w-full rounded-3xl bg-gradient-to-br from-white/10 to-white/0 p-5 text-left shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:scale-[1.01] lg:max-w-sm"
            style={{
              ['--nebula-border-gradient' as string]:
                'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0), rgba(255,255,255,0.05))',
            }}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-[9999px] bg-gradient-to-br from-orange-500 to-orange-600 p-0.5 shadow-lg shadow-orange-500/20">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[9999px] bg-black">
                  <img src="/brand/logo-mark.png" alt="" aria-hidden width={44} height={44} className="h-full w-full object-cover" />
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
