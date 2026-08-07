import Link from 'next/link'
import { NebulaReveal } from './NebulaReveal'

/**
 * The 2-up detail cards, rebuilt from the reference's "Mail / Support" and
 * "GitHub" cards (see docs/NEBULA_REFERENCE_NOTES.md §5).
 *
 * Both use the reference's elaborate *visual header* technique: a 256px
 * illustrative panel built entirely from divs and SVG — no screenshots, no
 * stock imagery — masked to fade into the card body, over a dot-grid field.
 *
 *   Left  — floating rotated UI widgets suggesting captured ideas/drafts.
 *   Right — the orbital diagram, repurposed for the open-source repo. This
 *           lands better here than in the reference: CreatorFlow genuinely
 *           is going open source, so a repo-at-the-centre-with-satellites
 *           diagram is describing something true.
 */

export function DetailCards() {
  return (
    <section id="docs" className="relative z-20 mx-auto mb-32 w-full max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Card 1 — floating widgets                                        */}
        {/* ---------------------------------------------------------------- */}
        <NebulaReveal>
          <div
            className="nebula-border group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/5 to-white/0"
            style={{
              ['--nebula-border-gradient' as string]:
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.1))',
            }}
          >
            <div
              className="group/art relative flex h-44 items-center justify-center overflow-hidden sm:h-52 bg-gradient-to-b from-white/[0.03] to-transparent"
              style={{
                maskImage: 'linear-gradient(180deg, transparent, black 0%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(180deg, transparent, black 0%, black 90%, transparent)',
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-30 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)]"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Floating widget — idea list, tilted left */}
              <div
                aria-hidden
                className="absolute left-4 top-7 w-28 -rotate-6 sm:left-10 sm:top-10 sm:w-32 rounded-xl border border-white/10 bg-zinc-900/60 p-3 shadow-xl backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:scale-105"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-[9999px] bg-orange-500/60" />
                  <div className="h-1 w-12 rounded-[9999px] bg-white/20" />
                </div>
                <div className="space-y-2">
                  {[16, 10, 14].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex h-2.5 w-2.5 items-center justify-center rounded-[3px] border border-white/20" />
                      <div className="h-1 rounded-[9999px] bg-white/10" style={{ width: `${w * 4}px` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating widget — a deal value, tilted right */}
              <div
                aria-hidden
                className="absolute right-4 top-6 flex h-10 w-20 rotate-12 sm:right-12 sm:top-8 items-center justify-center rounded-lg border border-orange-500/30 bg-zinc-900/90 shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:scale-105"
              >
                <span className="font-nebula-mono text-[10px] font-medium tracking-wider text-orange-400">
                  $1,500
                </span>
              </div>

              {/* Floating widget — draft grid, bottom right */}
              <div
                aria-hidden
                className="absolute bottom-8 right-10 hidden w-24 rotate-3 sm:block rounded-xl border border-white/10 bg-zinc-900/60 p-2.5 shadow-xl backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:scale-105"
              >
                <div className="mb-2 h-1 w-8 rounded-[9999px] bg-white/20" />
                <div className="grid grid-cols-2 gap-1.5">
                  {[10, 5, 10].map((o, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-[4px] border border-white/5"
                      style={{ background: `rgba(255,255,255,0.${o})` }}
                    />
                  ))}
                </div>
              </div>

              <div aria-hidden className="absolute bottom-6 left-12 hidden h-14 w-14 -rotate-3 sm:block rounded-lg border border-dashed border-white/10 opacity-30" />

              {/* Centre composition — a captured note */}
              <div className="relative z-10 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:scale-105">
                <div className="relative h-24 w-28">
                  <div className="absolute bottom-0 h-20 w-full rounded-xl border border-white/10 bg-zinc-800 shadow-2xl" />
                  <div className="absolute bottom-4 left-3 right-3 h-20 origin-bottom-left -rotate-3 rounded-lg border border-white/5 bg-zinc-700 shadow-md">
                    <div className="absolute left-3 top-3 h-1.5 w-1/2 rounded-[9999px] bg-zinc-600" />
                    <div className="absolute left-3 top-6 h-1.5 w-3/4 rounded-[9999px] bg-zinc-600" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 shadow-lg shadow-black/50">
                    <span className="font-nebula-heading text-base font-bold tracking-tighter text-orange-500">F</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-8 pt-7 sm:px-8 sm:pb-10">
              <h3 className="mb-5 font-nebula-heading text-xl font-semibold tracking-tight text-white">
                Nothing gets dropped
              </h3>
              <p className="mb-8 font-nebula-ui text-base leading-relaxed text-gray-400">
                Ideas, drafts and deals live in one place with a real status on each, not scattered
                across a notes app, a spreadsheet and an inbox you keep meaning to clean out.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 border-b border-transparent pb-1 font-nebula-ui text-sm font-medium text-orange-400 transition-colors hover:border-orange-400/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400"
              >
                Start capturing
              </Link>
            </div>
          </div>
        </NebulaReveal>

        {/* ---------------------------------------------------------------- */}
        {/* Card 2 — orbital open-source diagram                              */}
        {/* ---------------------------------------------------------------- */}
        <NebulaReveal delay={120}>
          <div
            className="nebula-border group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/5 to-white/0"
            style={{
              ['--nebula-border-gradient' as string]:
                'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.1))',
            }}
          >
            <div
              className="group/art relative flex h-44 items-center justify-center overflow-hidden sm:h-52 bg-gradient-to-b from-white/[0.03] to-transparent"
              style={{
                maskImage: 'linear-gradient(180deg, transparent, black 0%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(180deg, transparent, black 0%, black 85%, transparent)',
              }}
            >
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />

              <div className="relative flex h-full w-full items-center justify-center [perspective:1000px]">
                {/* Outer dashed orbit + live status pill */}
                <div aria-hidden className="absolute flex h-[200px] w-[200px] items-center justify-center rounded-[9999px] border border-dashed sm:h-[260px] sm:w-[260px] border-white/5 opacity-60">
                  <div className="absolute -top-3 z-10 flex items-center gap-1.5 rounded-[9999px] border border-white/10 bg-zinc-900 px-2 py-0.5 shadow-lg">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-[9999px] bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-[9999px] bg-emerald-500" />
                    </span>
                    <span className="font-nebula-mono text-[9px] tracking-tight text-zinc-400">public</span>
                  </div>
                </div>

                <div aria-hidden className="absolute h-32 w-32 rounded-[9999px] border border-dashed sm:h-40 sm:w-40 border-white/10" />

                {/* Centre hub — the repo */}
                <div className="relative z-20 flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:scale-105 group-hover/art:shadow-[0_0_50px_-10px_rgba(255,255,255,0.1)]">
                  <svg aria-hidden xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </div>

                {/* Satellites — placed by radius+angle from centre, not container
                    percentages, so they clear the hub instead of hiding behind it. Both
                    react to the whole illustration's hover (not their own) so the diagram
                    animates as one scene instead of only the piece under the cursor. */}
                <div
                  aria-hidden
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:z-20 group-hover/art:scale-110"
                  style={{ left: 'calc(50% + 75px)', top: 'calc(50% - 53px)' }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[9999px] border border-white/10 bg-zinc-900/90 shadow-lg shadow-orange-500/10 ring-1 ring-white/5 backdrop-blur">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                      <circle cx="18" cy="18" r="3" />
                      <circle cx="6" cy="6" r="3" />
                      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                      <line x1="6" x2="6" y1="9" y2="21" />
                    </svg>
                  </div>
                </div>

                <div
                  aria-hidden
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/art:z-20 group-hover/art:scale-110"
                  style={{ left: 'calc(50% - 75px)', top: 'calc(50% + 53px)' }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-[9999px] border border-white/10 bg-zinc-900/90 shadow-lg shadow-emerald-500/10 ring-1 ring-white/5 backdrop-blur">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>

                <div aria-hidden className="absolute left-[45%] top-[20%] h-2 w-2 rounded-[9999px] border border-white/10 bg-zinc-700" />
                <div aria-hidden className="absolute bottom-[20%] right-[42%] h-1.5 w-1.5 rounded-[9999px] border border-white/10 bg-zinc-700" />
              </div>
            </div>

            <div className="px-6 pb-8 pt-7 sm:px-8 sm:pb-10">
              <h3 className="mb-5 font-nebula-heading text-xl font-semibold tracking-tight text-white">
                Open source, and staying that way
              </h3>
              <p className="mb-8 font-nebula-ui text-base leading-relaxed text-gray-400">
                The whole thing is public. Read it, fork it, file an issue, or send a pull request.
                No paid tier waiting behind a feature flag.
              </p>
              <p className="font-nebula-ui text-sm leading-relaxed text-gray-500">
                Your data stays portable too: export everything, any time, even on the way out.
              </p>
            </div>
          </div>
        </NebulaReveal>
      </div>
    </section>
  )
}
