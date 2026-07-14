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

      <div className="container-shell relative z-10 pb-20 pt-16">
        <RevealUp>
          <div className="label-eyebrow mb-8">SYSTEM_CORE // CREATOR_OPS</div>
          <h1 className="text-display-lg max-w-[880px] text-white">
            Run your creator business
            <br />
            without losing your Gmail to it.
          </h1>
        </RevealUp>

        <RevealUp delay={1}>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="font-body-editorial max-w-[36rem] text-[1.05rem] leading-relaxed text-graphite">
              Track brand deals from first email to paid invoice, capture ideas before they slip
              away, and see what&apos;s actually working — free, with no cut taken from your deals,
              ever.
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
            Free means free — no percentage of your deals, no credit card to start.
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
