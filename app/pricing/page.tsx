import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'
import { Check, ArrowRight } from 'lucide-react'
import RevealUp from '@/components/editorial/RevealUp'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Pricing — CreatorFlow',
  description: 'CreatorFlow is free. No subscription, no cut of your deals, no catch.',
}

const included = [
  { feature: 'Unlimited deals', detail: 'Track every brand deal from inquiry to paid' },
  { feature: 'Unlimited ideas and drafts', detail: 'Capture and develop content without limits' },
  { feature: 'YouTube analytics', detail: 'Views, watch time, subscribers, top videos' },
  { feature: 'Team access', detail: 'You and one collaborator with role-based permissions' },
  { feature: 'AI contract review', detail: 'Flag risky terms before you sign — monthly allowance' },
  { feature: 'AI reply drafting', detail: 'Draft sponsorship replies from your rate card — monthly allowance' },
  { feature: 'AI repurposing suggestions', detail: 'Turn videos into clips, posts, outlines — monthly allowance' },
  { feature: 'Data export', detail: 'Download everything, any time — no questions asked' },
  { feature: 'Automations', detail: 'Pre-built workflows for Gmail deal detection' },
]

const faqs = [
  {
    q: 'Is it really free?',
    a: "Yes. CreatorFlow doesn't charge a subscription and doesn't take a percentage of your brand deals. The core workflow — tracking deals, capturing ideas, connecting YouTube — has no cost.",
  },
  {
    q: 'What are the AI usage limits?',
    a: "AI features (contract review, reply drafting, repurposing suggestions) have a generous monthly allowance on the free plan. This keeps the product sustainable for everyone. Most creators won't hit the limit in normal use.",
  },
  {
    q: 'What happens if I disconnect Gmail?',
    a: "Disconnecting Gmail does not delete any deal records you've already created. Your data is yours and stays in CreatorFlow.",
  },
  {
    q: 'Can I export my data?',
    a: 'Yes, at any time from Settings. You can download all your deals, ideas, drafts, and settings as structured files — even if you decide to leave.',
  },
  {
    q: 'Will this stay free?',
    a: "That's the plan. If pricing ever changes, existing users will be notified well in advance and given a path to export their data.",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />
      <main className="pt-[4.5rem]">
        {/* Header */}
        <section className="bg-linen px-6 py-24 text-center">
          <RevealUp>
            <div className="mx-auto flex flex-col items-center gap-6">
              <Badge variant="filled">Free forever</Badge>
              <h1 className="text-display-md max-w-[560px] text-carbon">Free. Actually free.</h1>
              <p className="font-body-editorial max-w-[520px] text-[18px] leading-relaxed text-graphite">
                CreatorFlow doesn&apos;t take a percentage of your brand deals, and it doesn&apos;t
                charge a subscription for the core product. Connect your accounts, track your deals,
                capture your ideas — no cost, no catch.
              </p>
            </div>
          </RevealUp>
        </section>

        {/* Main pricing card */}
        <section className="border-y border-fog bg-mist/30 py-16">
          <RevealUp delay={1}>
            <div className="container-shell flex flex-col items-start gap-10 lg:flex-row">
              <div className="glass-panel w-full shrink-0 rounded-xl p-8 lg:max-w-[400px]">
                <span className="font-label text-[11px] uppercase tracking-widest text-ash">Core plan</span>
                <div className="mt-2 flex items-end gap-1.5">
                  <span className="text-[56px] font-semibold leading-none tracking-tight text-carbon">$0</span>
                  <span className="mb-1.5 text-[16px] text-graphite">/ month</span>
                </div>
                <p className="mt-1 text-[13px] text-ash">No credit card required</p>

                <Button href="/onboarding" size="lg" className="mt-6 w-full">
                  Start free
                </Button>

                <p className="mt-4 border-t border-fog pt-4 text-center text-[12px] text-ash">
                  AI features have a generous monthly allowance so the product stays sustainable for
                  everyone.
                </p>
              </div>

              <div className="flex-1">
                <h2 className="mb-6 text-xl font-semibold text-carbon">Everything included</h2>
                <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item.feature} className="flex items-start gap-4 border-b border-fog py-4">
                      <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-lavender/10">
                        <Check size={9} className="text-lavender" strokeWidth={2.25} />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-carbon">{item.feature}</p>
                        <p className="mt-0.5 text-[13px] text-graphite">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealUp>
        </section>

        {/* FAQ */}
        <section className="bg-linen px-6 py-24">
          <RevealUp>
            <div className="mx-auto max-w-[720px]">
              <h2 className="mb-12 text-center text-2xl font-semibold text-carbon">Common questions</h2>
              <div className="flex flex-col divide-y divide-fog">
                {faqs.map((faq) => (
                  <div key={faq.q} className="py-6">
                    <h3 className="mb-2 text-[15px] font-semibold text-carbon">{faq.q}</h3>
                    <p className="font-body-editorial text-[14px] leading-relaxed text-graphite">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealUp>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-fog bg-mist/30 px-6 py-20">
          <RevealUp>
            <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 text-center">
              <h2 className="text-display-sm text-carbon">Ready to get started?</h2>
              <p className="font-body-editorial text-[15px] text-graphite">
                Sign up in under a minute. No credit card, no commitment.
              </p>
              <Button href="/onboarding" size="lg" iconRight={<ArrowRight size={14} />}>
                Start free
              </Button>
            </div>
          </RevealUp>
        </section>
      </main>
      <Footer />
    </div>
  )
}
