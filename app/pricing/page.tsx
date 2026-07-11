import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

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
    a: 'Disconnecting Gmail does not delete any deal records you\'ve already created. Your data is yours and stays in CreatorFlow.',
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
    <div className="min-h-screen bg-paper-white">
      <Nav />
      <main>
        {/* Header */}
        <section className="py-20 px-6 text-center bg-paper-white">
          <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2 bg-mint-wash border border-mint/20 rounded-full px-4 py-1.5">
              <span className="text-[13px] font-semibold text-mint">Free forever</span>
            </div>
            <h1
              className="font-bold text-carbon text-balance max-w-[560px]"
              style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.05em' }}
            >
              Free. Actually free.
            </h1>
            <p className="text-graphite max-w-[520px]" style={{ fontSize: '18px', lineHeight: 1.55, letterSpacing: '-0.32px' }}>
              CreatorFlow doesn&apos;t take a percentage of your brand deals, and it doesn&apos;t charge a subscription for the core product. Connect your accounts, track your deals, capture your ideas — no cost, no catch.
            </p>
          </div>
        </section>

        {/* Main pricing card */}
        <section className="bg-linen py-12 px-6">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 items-start">

            {/* Card */}
            <div
              className="w-full lg:max-w-[400px] bg-paper-white border border-fog rounded-3xl p-8 flex flex-col gap-6 shrink-0"
              style={{ boxShadow: 'rgba(0,0,0,0.06) 0px 1px 3px 0px, rgba(0,0,0,0.06) 0px 8px 16px 0px, rgba(0,0,0,0.02) 0px 0px 0px 1px' }}
            >
              <div>
                <span className="text-[12px] font-semibold text-ash uppercase tracking-wider">Core Plan</span>
                <div className="flex items-end gap-1.5 mt-2">
                  <span className="text-[56px] font-bold text-carbon leading-none tracking-[-0.05em]">$0</span>
                  <span className="text-[16px] text-graphite mb-1.5">/ month</span>
                </div>
                <p className="text-[13px] text-ash mt-1">No credit card required</p>
              </div>

              <Link
                href="/onboarding"
                className="w-full text-center text-[14px] font-medium text-paper-white bg-lavender py-3 rounded-full hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
              >
                Start free
              </Link>

              <p className="text-[12px] text-ash text-center border-t border-fog pt-4">
                AI features have a generous monthly allowance so the product stays sustainable for everyone.
              </p>
            </div>

            {/* Feature list */}
            <div className="flex-1">
              <h2
                className="font-semibold text-carbon mb-6"
                style={{ fontSize: '20px', lineHeight: 1.3, letterSpacing: '-0.4px' }}
              >
                Everything included
              </h2>
              <ul className="flex flex-col gap-0 divide-y divide-fog">
                {included.map((item) => (
                  <li key={item.feature} className="flex items-start gap-4 py-4">
                    <div className="w-5 h-5 rounded-full bg-mint-wash flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#33c758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-carbon">{item.feature}</p>
                      <p className="text-[13px] text-graphite mt-0.5">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-paper-white py-20 px-6">
          <div className="max-w-[720px] mx-auto">
            <h2
              className="font-bold text-carbon mb-10 text-center"
              style={{ fontSize: '28px', lineHeight: 1.25, letterSpacing: '-0.5px' }}
            >
              Common questions
            </h2>
            <div className="flex flex-col divide-y divide-fog">
              {faqs.map((faq) => (
                <div key={faq.q} className="py-6">
                  <h3
                    className="font-semibold text-carbon mb-2"
                    style={{ fontSize: '15px', letterSpacing: '-0.25px' }}
                  >
                    {faq.q}
                  </h3>
                  <p className="text-graphite" style={{ fontSize: '14px', lineHeight: 1.6, letterSpacing: '-0.25px' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-linen py-16 px-6 border-t border-fog">
          <div className="max-w-[560px] mx-auto text-center flex flex-col items-center gap-5">
            <h2
              className="font-bold text-carbon text-balance"
              style={{ fontSize: '28px', lineHeight: 1.25, letterSpacing: '-0.5px' }}
            >
              Ready to get started?
            </h2>
            <p className="text-graphite" style={{ fontSize: '15px', lineHeight: 1.55 }}>
              Sign up in under a minute. No credit card, no commitment.
            </p>
            <Link
              href="/onboarding"
              className="text-[14px] font-medium text-paper-white bg-lavender px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
              style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
            >
              Start free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
