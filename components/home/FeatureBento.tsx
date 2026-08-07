import type { ReactNode } from 'react'
import { NebulaReveal } from './NebulaReveal'

/**
 * Bento feature grid (DESIGN.md → Page Sections → Feature Grid):
 * `2.5rem` glass cards with gradient borders and a hover glow wash.
 *
 * Every card describes a module that actually exists and ships in the P0
 * scope from docs/PRD.md. Nothing here is aspirational, and AI-assisted
 * features that are still previews are labelled as previews.
 */

type Feature = {
  title: string
  body: string
  glow: string
  span?: string
  icon: ReactNode
}

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const FEATURES: Feature[] = [
  {
    title: 'Ideas that survive the shower thought',
    body: 'Capture an idea the second you have it, give it a status, and turn it into a draft when you are ready to write. No more notes app graveyard.',
    glow: 'from-orange-500/10',
    span: 'md:col-span-2',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    title: 'Drafts, tied to the idea',
    body: 'A focused editor that remembers which idea it came from, warns you before you lose unsaved work, and stays out of the way.',
    glow: 'from-white/10',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M9 3h6v4H9z" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
  },
  {
    title: 'Your channel, next to your pipeline',
    body: 'Views, watch time and subscriber movement sitting beside your deals, so you can see which content actually drives sponsorship interest.',
    glow: 'from-orange-500/10',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" rx="1" />
        <rect x="12" y="8" width="3" height="10" rx="1" />
        <rect x="17" y="5" width="3" height="13" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Bring in a manager without handing over the keys',
    body: 'Invite a collaborator with their own login and a scoped role. They get the work; your settings and account stay yours.',
    glow: 'from-white/10',
    span: 'md:col-span-2',
    icon: (
      <svg {...iconProps} aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export function FeatureBento() {
  return (
    <section id="how-it-works" className="relative z-20 mx-auto mb-32 w-full max-w-7xl px-6">
      <NebulaReveal>
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 font-nebula-mono text-xs uppercase tracking-widest text-orange-400">
            The modules
          </p>
          <h2 className="font-nebula-heading text-3xl font-semibold leading-[1.1] tracking-tight text-white md:text-5xl">
            The business side of your channel, in one place.
          </h2>
        </div>
      </NebulaReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <NebulaReveal key={feature.title} delay={i * 120} className={feature.span ?? ''}>
            <div
              className="nebula-border group relative h-full overflow-hidden rounded-[2.5rem] bg-zinc-900/40 p-10 backdrop-blur-sm transition-all duration-500 hover:bg-zinc-900/60"
              style={{
                ['--nebula-border-gradient' as string]:
                  'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0), rgba(255,255,255,0.1))',
              }}
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${feature.glow} via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative z-10">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-nebula-heading text-xl font-semibold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="font-nebula-ui leading-relaxed text-gray-400">{feature.body}</p>
              </div>
            </div>
          </NebulaReveal>
        ))}
      </div>
    </section>
  )
}
