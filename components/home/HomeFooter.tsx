import Link from 'next/link'
import { NebulaReveal } from './NebulaReveal'
import { ShinyCTA } from './ShinyCTA'

/**
 * Closing CTA + footer. No pricing column, no pricing link — the product
 * is open source (PRODUCT.md → Positioning).
 */

const REPO_URL = 'https://github.com/deep8904/CreatorFlow'

type FooterLink = { label: string; href: string | null; note?: string; external?: boolean }
type FooterColumn = { heading: string; links: FooterLink[] }

// `href: null` items render as inert, honestly-disabled text rather than a
// link to nowhere — Privacy/Terms have no pages to point to yet, and a
// real-looking link that goes nowhere is worse than none. The Open source
// column links out to the now-public repo (`external: true` renders a plain
// <a target="_blank">, not a next/link Link, since these leave the app).
const COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Deals', href: '#product' },
      { label: 'Ideas & drafts', href: '#how-it-works' },
      { label: 'Analytics', href: '#how-it-works' },
      { label: 'Team', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Open source',
    links: [
      { label: 'Source code', href: REPO_URL, external: true },
      { label: 'Contributing', href: `${REPO_URL}/blob/main/CONTRIBUTING.md`, external: true },
      { label: 'Issues', href: `${REPO_URL}/issues`, external: true },
      { label: 'License', href: `${REPO_URL}/blob/main/LICENSE`, external: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Docs', href: '#docs' },
      { label: 'Privacy', href: null, note: 'Not published yet' },
      { label: 'Terms', href: null, note: 'Not published yet' },
    ],
  },
]

export function HomeFooter() {
  return (
    <>
      <section className="relative z-20 mx-auto mb-32 w-full max-w-7xl px-6">
        <NebulaReveal>
          <div
            className="nebula-grain nebula-border relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/0 px-8 py-20 text-center backdrop-blur-lg md:px-16"
            style={{
              ['--nebula-border-gradient' as string]:
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.1))',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-1/2 w-2/3 -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-orange-500/20 to-transparent"
            />
            <div className="relative z-10">
              <h2 className="mx-auto mb-6 max-w-3xl font-nebula-heading text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-6xl">
                Stop running your business out of your inbox.
              </h2>
              <p className="mx-auto mb-10 max-w-xl font-nebula-ui text-lg leading-relaxed text-gray-400">
                Free, open source, and yours to keep. No subscription, no percentage of your deals,
                no credit card to start.
              </p>
              <ShinyCTA href="/onboarding">Start free</ShinyCTA>
            </div>
          </div>
        </NebulaReveal>
      </section>

      {/* No backdrop-blur on the footer: it sits directly on the opaque black
          page rather than over content, so the blur samples nothing — and in
          Chromium it blanked the footer's own children (same artifact as the
          nested-blur pipeline rows). The tonal bg-zinc-900/30 gives the tier
          separation DESIGN.md wants without the filter. */}
      <footer className="relative z-20 w-full border-t border-white/5 bg-zinc-900/30 pb-8 pt-24">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span aria-hidden className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-orange-500 to-orange-700 font-nebula-tech text-[11px] font-bold text-white">
                  F
                </span>
                <span className="font-nebula-ui text-base font-medium tracking-tight text-white">
                  CreatorFlow
                </span>
              </div>
              <p className="max-w-xs font-nebula-ui text-sm leading-relaxed text-gray-500">
                The business side of your channel — brand deals, ideas, drafts and analytics — in
                one place. Free and open source.
              </p>
            </div>

            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="mb-4 font-nebula-mono text-xs uppercase tracking-widest text-gray-500">
                  {column.heading}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => {
                    const linkClassName =
                      "relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] inline-block rounded font-nebula-ui text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                    if (!link.href) {
                      return (
                        <li key={link.label}>
                          <span title={link.note} className="inline-block cursor-not-allowed font-nebula-ui text-sm text-gray-600">
                            {link.label}
                          </span>
                        </li>
                      )
                    }
                    if (link.external) {
                      return (
                        <li key={link.label}>
                          <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                            {link.label}
                          </a>
                        </li>
                      )
                    }
                    return (
                      <li key={link.label}>
                        <Link href={link.href} className={linkClassName}>
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center">
            <p className="font-nebula-ui text-xs text-gray-600">
              © {new Date().getFullYear()} CreatorFlow. Free and open source.
            </p>
            <p className="font-nebula-mono text-xs text-gray-600">
              We never sell your data, and never train models on your inbox.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
