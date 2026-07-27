import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * The Nebula signature action, rebuilt at full fidelity against the
 * reference (see docs/NEBULA_REFERENCE_NOTES.md §2). Six stacked layers:
 *
 *   1. conic border beam  — dual-background padding-box/border-box trick,
 *                           spun by an animatable registered @property
 *   2. inner hairline     — inset 1px #1a1818
 *   3. dot field          — radial dots masked to a rotating conic arc
 *   4. shimmer sweep      — rotating gradient under a radial mask
 *   5. breathing glow     — inset orange shadow, scale-pulsed, fades in on hover
 *   6. press              — translateY(1px)
 *
 * All of that lives in `.nebula-cta` in globals.css because it needs
 * `@property`, `::before`/`::after`, and mask-composite — none of which are
 * expressible in Tailwind utilities. This component supplies the structure
 * and the label wrapper the glow layer hangs off.
 */
export function ShinyCTA({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`nebula-cta group inline-flex items-center justify-center px-12 py-5 font-nebula-tech text-sm font-medium uppercase tracking-widest text-white transition-[transform,box-shadow] duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 ${className}`}
    >
      <span className="nebula-cta__label gap-2">
        <span className="text-white/90 transition-colors group-hover:text-white">{children}</span>
        <svg
          aria-hidden
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}
