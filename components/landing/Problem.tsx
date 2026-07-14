import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import RevealUp from '@/components/editorial/RevealUp'

export default function Problem() {
  return (
    <section className="bg-linen py-24 md:py-40">
      <div className="container-shell">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          <RevealUp className="lg:col-span-5">
            <div className="label-eyebrow mb-8">THE_ACTUAL_PROBLEM</div>
            <h2 className="text-display-sm text-white">
              Your business runs on Gmail, a spreadsheet, and memory.
            </h2>
            <Link href="#features" className="btn-outline-editorial mt-8">
              See what replaces it
              <ArrowRight size={14} />
            </Link>
          </RevealUp>

          <RevealUp delay={1} className="lg:col-span-7">
            <div className="font-body-editorial flex flex-col gap-8 text-[17px] leading-relaxed text-white">
              <p>
                Every brand deal starts as an email you tell yourself you&apos;ll deal with later.
                Every idea is a note in your phone you&apos;ll forget by dinner. Your actual channel
                performance lives in a tab you rarely open, disconnected from the deals it&apos;s
                supposed to be driving.
              </p>
              <div className="border-l border-white/20 pl-6 text-graphite lg:pl-10">
                <p>
                  CreatorFlow isn&apos;t a lifestyle brand or a growth-hack tool — it&apos;s the
                  operational layer for creators who are serious about the business side, not just
                  the top 1% with a full-time manager. <strong className="text-white">Free, always, no cut of your deals.</strong>
                </p>
              </div>
            </div>
          </RevealUp>
        </div>
      </div>
    </section>
  )
}
