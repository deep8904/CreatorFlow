import { NebulaReveal } from './NebulaReveal'

/**
 * Infinite marquee (DESIGN.md → Components → "Logo Marquee"): edge-masked,
 * paused on hover.
 *
 * Content note: the reference fills this slot with partner/customer logos.
 * CreatorFlow has neither, and PRODUCT.md → Evidence on Hand forbids
 * inventing them. It previously showed the tech stack, which said nothing a
 * creator cares about. It now carries the product's actual commitments —
 * each one a verifiable fact from PRODUCT.md, and each one a real
 * differentiator against the tools this audience is choosing between.
 */

const COMMITMENTS = [
  'No cut of your deals, ever',
  'Free forever, no paid tier',
  'Open source',
  'Export everything, any time',
  'No lock-in on cancel',
  'Your own login per teammate',
  'We never train on your inbox',
]

export function StackMarquee() {
  return (
    <NebulaReveal delay={1200}>
      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-12 md:pb-20">
        <div className="nebula-marquee group inline-flex w-full flex-nowrap overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_96px,black_calc(100%-96px),transparent_100%)]">
          <div className="nebula-marquee-track flex w-max items-center">
            {/* Duplicated once so the -50% translate loops seamlessly. */}
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                {COMMITMENTS.map((item) => (
                  <div key={`${copy}-${item}`} className="mx-6 flex shrink-0 items-center gap-3">
                    <span aria-hidden className="h-1 w-1 shrink-0 rotate-45 bg-orange-500" />
                    <span className="whitespace-nowrap font-nebula-mono text-xs uppercase tracking-widest text-zinc-500 transition-colors duration-500 group-hover:text-zinc-300 sm:text-[13px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </NebulaReveal>
  )
}
