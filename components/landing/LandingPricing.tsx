import Link from 'next/link'
import { Check } from 'lucide-react'

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
    <section className="bg-linen py-24 px-6">
      <div className="max-w-[1200px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            <div>
              <span
                className="inline-block text-[11.5px] font-semibold text-lavender uppercase tracking-widest mb-3"
              >
                Pricing
              </span>
              <h2
                className="font-bold text-carbon text-balance"
                style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.12, letterSpacing: '-0.04em' }}
              >
                Free. Actually free.
              </h2>
            </div>
            <p
              className="text-graphite"
              style={{ fontSize: '16px', lineHeight: 1.6, letterSpacing: '-0.25px', maxWidth: '400px' }}
            >
              CreatorFlow doesn&apos;t take a percentage of your brand deals and doesn&apos;t charge a monthly subscription for the core product. Connect, track, and capture — no cost, no catch.
            </p>

            {/* Feature checklist */}
            <ul className="flex flex-col gap-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-mint-wash flex items-center justify-center shrink-0">
                    <Check size={10} stroke="#33c758" strokeWidth={2.5} />
                  </div>
                  <span className="text-[14px] text-carbon" style={{ letterSpacing: '-0.25px' }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/pricing" className="text-[14px] font-medium text-lavender hover:opacity-70 transition-opacity" style={{ letterSpacing: '-0.25px' }}>
              See full plan details →
            </Link>
          </div>

          {/* Right — pricing card */}
          <div
            className="bg-paper-white border border-fog rounded-3xl px-8 py-10 flex flex-col gap-6"
            style={{ boxShadow: 'rgba(0,0,0,0.06) 0px 1px 3px 0px, rgba(0,0,0,0.06) 0px 8px 16px 0px, rgba(0,0,0,0.02) 0px 0px 0px 1px' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-semibold text-ash uppercase tracking-wider">Core Plan</span>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-mint-wash text-mint"
                >
                  Always free
                </span>
              </div>
              <div className="flex items-end gap-1.5">
                <span
                  className="font-bold text-carbon"
                  style={{ fontSize: '52px', lineHeight: 1, letterSpacing: '-0.05em' }}
                >
                  $0
                </span>
                <span className="text-[15px] text-graphite mb-2">/ month</span>
              </div>
              <p className="text-[13px] text-ash mt-1" style={{ letterSpacing: '-0.2px' }}>No credit card required</p>
            </div>

            <div className="h-px bg-fog" />

            <ul className="flex flex-col gap-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-4.5 h-4.5 rounded-full bg-mint-wash flex items-center justify-center shrink-0">
                    <Check size={9} stroke="#33c758" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13.5px] text-carbon" style={{ letterSpacing: '-0.25px' }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/onboarding"
              className="w-full text-center text-[14px] font-semibold text-paper-white bg-lavender px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              style={{
                letterSpacing: '-0.25px',
                boxShadow: 'rgba(145,141,246,0.35) 0px 4px 16px 0px, rgba(0,0,0,0.06) 0px 1px 2px 0px',
              }}
            >
              Start free — no card needed
            </Link>

            <p className="text-[12px] text-ash text-center" style={{ letterSpacing: '-0.2px' }}>
              AI features include a generous monthly allowance so the product stays sustainable.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
