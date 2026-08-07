import { NebulaReveal } from './NebulaReveal'

/**
 * The `2.5rem` mega-card (DESIGN.md → Page Sections → Feature Grid):
 * glassmorphic surface, gradient border, text left / product visual right,
 * with a soft gradient glow behind the lower half.
 *
 * The right pane dramatises the actual mechanism — a brand-deal pipeline
 * moving through real stages — rather than decorating with a generic
 * gradient. Figures shown are demonstration data, labelled as such below.
 */

const PIPELINE = [
  { brand: 'Aura Skincare', deliverable: '1 dedicated YouTube video', value: '$1,500', stage: 'Inbound', tone: 'text-gray-400' },
  { brand: 'Verve Energy', deliverable: '1 video + usage rights', value: '$1,750', stage: 'Negotiating', tone: 'text-orange-400' },
  { brand: 'Glowlab Cosmetics', deliverable: '1 integration', value: '$1,300', stage: 'Contracted', tone: 'text-orange-300' },
  { brand: 'Nordfeld Outdoor', deliverable: '1 video', value: '$1,750', stage: 'Paid', tone: 'text-emerald-400' },
]

export function FeatureShowcase() {
  return (
    <section id="product" className="relative z-20 mx-auto mb-24 mt-24 w-full max-w-7xl px-2 pb-32 pt-10">
      <NebulaReveal>
        <div
          className="nebula-border group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-lg"
          style={{
            ['--nebula-border-gradient' as string]:
              'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.1))',
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent opacity-40"
          />

          <div className="grid gap-0 lg:grid-cols-2">
            {/* Text */}
            <div className="relative z-10 flex flex-col justify-center p-8 md:p-16">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                <svg
                  aria-hidden
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>

              <h2 className="mb-6 mt-6 font-nebula-heading text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-4xl">
                Every brand deal, from first email to paid.
              </h2>

              <div className="space-y-6 font-nebula-ui text-lg leading-relaxed text-gray-400">
                <p>
                  Deals move through a pipeline you can actually see: Inbound, Negotiating,
                  Contracted, Delivered, Paid. Nothing sits forgotten in an inbox.
                </p>
                <p>
                  Connect Gmail and likely sponsorship emails get surfaced into their own view. It
                  mirrors your mail; it never deletes or modifies the original. Prefer to work
                  manually? Deals work fully without connecting anything.
                </p>
                <p>
                  And your data stays yours: export everything, any time, even on the way out.
                </p>
              </div>
            </div>

            {/* Visual */}
            <div className="relative min-h-[500px] overflow-hidden border-l border-white/5 bg-zinc-950/30">
              <div className="absolute inset-0 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full rounded-[9999px] bg-orange-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-[9999px] bg-orange-500" />
                    </span>
                    <p className="font-nebula-mono text-xs tracking-wide text-orange-400">
                      PIPELINE · 17 ACTIVE
                    </p>
                  </div>
                  <p className="font-nebula-mono text-xs text-gray-500">$23,250</p>
                </div>

                <div className="space-y-3">
                  {PIPELINE.map((deal) => (
                    <div
                      key={deal.brand}
                      /* No backdrop-blur here on purpose: this card sits inside
                         the mega-card, which already carries backdrop-blur-lg.
                         Nesting backdrop-filters makes Chromium blank the inner
                         element's own content — the rows rendered as empty
                         rectangles until this was removed. The elevated-surface
                         blur DESIGN.md asks for lives on the parent. */
                      className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-nebula-ui text-sm font-medium text-white">
                            {deal.brand}
                          </p>
                          <p className="mt-0.5 truncate font-nebula-ui text-xs text-gray-500">
                            {deal.deliverable}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-nebula-mono text-sm text-white">{deal.value}</p>
                          <p className={`mt-0.5 font-nebula-mono text-[11px] uppercase tracking-wider ${deal.tone}`}>
                            {deal.stage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 font-nebula-mono text-[11px] leading-relaxed text-gray-600">
                  Demonstration data, not a real creator&apos;s figures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </NebulaReveal>
    </section>
  )
}
