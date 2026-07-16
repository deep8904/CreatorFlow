import Link from 'next/link'
import { ArrowUpRight, Play } from 'lucide-react'
import DotGrid from '@/components/editorial/DotGrid'
import RevealUp from '@/components/editorial/RevealUp'

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-linen pt-[4.5rem]">
      <DotGrid />

      {/* Swiss grid overlay lines — padding matches .container-shell so the lines track the content edges */}
      <div
        className="pointer-events-none absolute inset-0 flex justify-between opacity-10"
        style={{ paddingInline: 'clamp(1.5rem, 4vw, 6rem)' }}
      >
        <div className="h-full w-px bg-white" />
        <div className="hidden h-full w-px bg-white md:block" />
        <div className="hidden h-full w-px bg-white lg:block" />
        <div className="h-full w-px bg-white" />
      </div>

      {/* Registration marks at the grid-line intersections — a print/technical
          alignment motif (crosshair + circle) that plays off SYSTEM_CORE //
          CREATOR_OPS, rather than a decorative flourish. Orange, used sparingly. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[4.5rem] hidden justify-between pt-6 md:flex"
        style={{ paddingInline: 'clamp(1.5rem, 4vw, 6rem)' }}
      >
        <RegistrationMark />
        <RegistrationMark className="hidden lg:block" />
        <RegistrationMark className="hidden lg:block" />
        <RegistrationMark />
      </div>

      <div className="container-shell relative z-10 pb-20 pt-16">
        <RevealUp>
          <div className="label-eyebrow mb-8">IDEA_TO_PUBLISHED // CREATOR_OPS</div>
          <h1 className="text-display-lg max-w-[880px] text-white">
            Fewer dropped ideas.
            <br />
            More consistent you.
          </h1>
        </RevealUp>

        <RevealUp delay={1}>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="font-body-editorial max-w-[36rem] text-[1.05rem] leading-relaxed text-graphite">
              Every idea captured before it slips away. Every brand deal tracked so nothing falls
              through the cracks. A faster path from idea to published. And a clear read on what&apos;s
              actually working, so the next thing you make is better than the last.
            </p>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/onboarding" className="btn-editorial group">
                <span className="relative z-10 flex items-center gap-2">
                  Start free
                  <ArrowUpRight size={16} className="icon-arrow" />
                </span>
              </Link>
              <Link href="#how-it-works" className="btn-outline-editorial">
                <Play size={13} />
                See how it works
              </Link>
            </div>
          </div>
        </RevealUp>

        <RevealUp delay={2}>
          <p className="mt-6 font-label text-[11px] uppercase tracking-widest text-ash">
            No dropped ideas. No missed deals. No guessing what worked.
          </p>
        </RevealUp>

        {/* Product preview panel */}
        <RevealUp delay={3} className="mt-16">
          <div className="glass-panel relative aspect-[16/10] w-full overflow-hidden rounded-lg shadow-[0_20px_60px_-15px_rgba(249,115,22,0.12)] md:aspect-[21/9]">
            {/* UI chrome header */}
            <div className="flex h-12 items-center gap-4 border-b border-white/10 bg-white/[0.02] px-6">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="ml-4 flex gap-6 font-label text-[11px] uppercase text-ash">
                <span className="border-b border-lavender pb-1 text-white">Dashboard</span>
                <span>Deals</span>
                <span>Ideas</span>
              </div>
            </div>

            {/* Body grid */}
            <div className="grid flex-grow grid-cols-1 gap-6 bg-[#050505] p-6 md:grid-cols-3">
              {/* Pipeline chart-ish area */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded border border-white/5 bg-paper-white/50 p-6 md:col-span-2">
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <span className="mb-1 block font-label text-[11px] uppercase text-ash">Revenue_MTD</span>
                    <span className="text-3xl font-semibold tracking-tight text-white">$12.4K</span>
                  </div>
                  <span className="rounded bg-lavender/15 px-2 py-1 text-xs text-lavender">+18% MoM</span>
                </div>
                <div className="mt-auto flex h-[110px] items-end gap-2">
                  {[30, 45, 60, 40, 80, 55, 100].map((h, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t bg-white/10 transition-colors duration-300 group-hover:bg-lavender/40"
                      style={{ height: `${h}%`, background: i === 6 ? '#F97316' : undefined }}
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar mini pipeline */}
              <div className="flex flex-col gap-3 rounded border border-white/5 bg-paper-white/50 p-6">
                <span className="mb-1 font-label text-[11px] uppercase text-ash">Deal_Pipeline</span>
                {[
                  { stage: 'Inbound', count: 3 },
                  { stage: 'Negotiating', count: 2 },
                  { stage: 'Paid', count: 1 },
                ].map((s) => (
                  <div key={s.stage} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-lavender" /> {s.stage}
                    </div>
                    <span className="font-label text-xs text-ash">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealUp>
      </div>
    </section>
  )
}

function RegistrationMark({ className = '' }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" className={`text-lavender ${className}`} aria-hidden="true">
      <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="5.5" cy="5.5" r="3.25" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}
