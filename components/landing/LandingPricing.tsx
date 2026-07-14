import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import RevealUp from '@/components/editorial/RevealUp'

const included = [
  'Unlimited deals tracked',
  'Unlimited ideas and drafts',
  'YouTube analytics integration',
  'Team access (you + one collaborator)',
  'Monthly AI usage allowance',
  'Full data export, any time',
]

export default function LandingPricing() {
  return (
    <section className="border-t border-fog bg-mist/30 py-24 md:py-32">
      <div className="container-shell">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24 xl:grid-cols-[1fr_460px]">
          {/* Left — copy */}
          <RevealUp>
            <div className="label-eyebrow mb-6">PRICING</div>
            <h2 className="text-display-sm mb-6 text-white">Free. Actually free.</h2>
            <p className="font-body-editorial mb-8 max-w-[26rem] text-[16px] leading-relaxed text-graphite">
              CreatorFlow doesn&apos;t take a percentage of your brand deals and doesn&apos;t charge a
              monthly subscription for the core product. Connect, track, and capture — no cost, no
              catch.
            </p>
            <ul className="mb-8 flex flex-col gap-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-wash">
                    <Check size={10} className="text-mint" strokeWidth={2.5} />
                  </div>
                  <span className="text-[14px] text-white">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-outline-editorial">
              See full plan details
              <ArrowRight size={14} />
            </Link>
          </RevealUp>

          {/* Right — pricing card */}
          <RevealUp delay={1}>
            <div className="glass-panel flex flex-col gap-6 rounded-lg px-8 py-10">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-label text-[11px] uppercase tracking-widest text-ash">Core plan</span>
                  <span className="rounded-full bg-mint-wash px-2.5 py-1 text-[11px] font-semibold text-mint">
                    Always free
                  </span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-[52px] font-semibold leading-none tracking-tight text-white">$0</span>
                  <span className="mb-2 text-[15px] text-graphite">/ month</span>
                </div>
                <p className="mt-1 text-[13px] text-ash">No credit card required</p>
              </div>

              <div className="h-px bg-fog" />

              <ul className="flex flex-col gap-3">
                {included.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-mint-wash">
                      <Check size={9} className="text-mint" strokeWidth={2.5} />
                    </div>
                    <span className="text-[13.5px] text-white">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/onboarding" className="btn-editorial w-full">
                <span className="relative z-10">Start free — no card needed</span>
              </Link>

              <p className="text-center text-[12px] text-ash">
                AI features include a generous monthly allowance so the product stays sustainable.
              </p>
            </div>
          </RevealUp>
        </div>
      </div>
    </section>
  )
}
