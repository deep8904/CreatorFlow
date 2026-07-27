import { HeroCurtain } from './HeroCurtain'
import { NebulaReveal } from './NebulaReveal'
import { RollPhrase } from './RollPhrase'
import { ShinyCTA } from './ShinyCTA'

/**
 * Hero (DESIGN.md → Page Sections → Hero Section). Radial top-glow +
 * grain behind the grid curtain, badge, gradient-clipped Manrope headline
 * with the emphasised phrase on interactive letter-roll, subtext, and the
 * shiny CTA.
 *
 * Copy is CreatorFlow's locked marketing copy from docs/DESIGN_BRIEF.md —
 * the visual world changed, the product's voice did not.
 */
export function Hero() {
  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-32 md:min-h-screen md:pt-20"
      style={{
        maskImage: 'linear-gradient(180deg, transparent, black 0%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, black 0%, black 95%, transparent)',
      }}
    >
      {/* Radial top-glow + grain */}
      <div aria-hidden className="nebula-grain absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-[-10%] h-[80%] w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-white/[0.06] via-zinc-900/10 to-black" />
      </div>

      <HeroCurtain />

      <div className="relative z-10 mx-auto mb-24 mt-24 max-w-5xl px-6 text-center">
        <NebulaReveal delay={200}>
          <div
            className="nebula-border group relative mb-10 inline-flex cursor-default items-center gap-2 rounded-[9999px] bg-gradient-to-br from-white/10 to-white/0 py-1.5 pl-3 pr-3 backdrop-blur-sm"
            style={{
              ['--nebula-border-gradient' as string]:
                'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.1))',
            }}
          >
            <span aria-hidden className="flex h-1.5 w-1.5 rounded-[9999px] bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <span className="font-nebula-ui text-xs font-medium tracking-wide text-orange-100/80 transition-colors group-hover:text-white">
              Free &amp; open source — no cut of your deals
            </span>
          </div>
        </NebulaReveal>

        <NebulaReveal delay={400}>
          {/* aria-label carries the real sentence: the visual treatment splits
              the headline into per-word and per-character spans, which the
              accessible-name computation concatenates without spaces
              ("Fewerdroppedideas.Moreconsistentyou."). The label restores
              correct pronunciation and keeps the heading findable; the split
              rendering below is decoration and is hidden from the a11y tree.

              Sizes step rather than jumping 6xl→8xl at one breakpoint —
              CreatorFlow's headline is longer than the reference's and bled to
              both edges between ~768px and ~1100px. */}
          <h1
            aria-label="Fewer dropped ideas. More consistent you."
            className="mb-8 flex flex-wrap justify-center gap-x-[0.25em] gap-y-2 font-nebula-heading text-4xl font-medium leading-[1.08] tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
          >
            <span aria-hidden className="contents">
            <span className="inline-flex bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent opacity-60">
              Fewer
            </span>
            <RollPhrase text="dropped ideas." />
            <span className="inline-flex bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent opacity-60">
              More
            </span>
            <span className="inline-flex bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent opacity-60">
              consistent
            </span>
            <span className="inline-flex bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent opacity-60">
              you.
            </span>
            </span>
          </h1>
        </NebulaReveal>

        <NebulaReveal delay={600}>
          <p className="mx-auto mb-12 max-w-3xl font-nebula-heading text-xl font-medium leading-relaxed tracking-normal text-gray-400 md:text-2xl">
            Every idea captured before it slips away. Every brand deal tracked so nothing falls
            through the cracks. A faster path from idea to published — and a clear read on what&apos;s
            actually working.
          </p>
        </NebulaReveal>

        <NebulaReveal delay={800}>
          <div className="mb-12 flex flex-col items-center justify-center gap-6 md:flex-row">
            <ShinyCTA href="/onboarding">Start free</ShinyCTA>
          </div>
        </NebulaReveal>

        <NebulaReveal delay={1000}>
          <div className="mb-20 mt-32 flex flex-col items-center gap-4">
            <p className="font-nebula-ui text-xs font-medium uppercase tracking-widest text-gray-500">
              Built in the open, for creators who run their own business
            </p>
            {/* Not a Link: no public repository exists yet — an inert,
                honestly-disabled item beats a link to nowhere. */}
            <span
              title="Repository isn't public yet"
              className="inline-flex cursor-not-allowed items-center gap-1 border-b border-transparent pb-0.5 font-nebula-ui text-sm text-gray-600"
            >
              Read the source
            </span>
          </div>
        </NebulaReveal>
      </div>
    </section>
  )
}
