import Link from 'next/link'

/**
 * Floating glassmorphic pill navigation (DESIGN.md → Page Sections →
 * Navigation): `backdrop-blur-xl`, a gradient border drawn with the
 * mask-composite technique, and a 3D "Start free" surface whose border
 * beam spins in on hover.
 *
 * There is deliberately no Pricing link: CreatorFlow is open source, and
 * PRODUCT.md forbids pricing content, links, or CTAs on marketing surfaces.
 */

const LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Docs', href: '#docs' },
]

export function NebulaNav() {
  return (
    <div className="fixed left-0 top-0 z-50 flex w-full justify-center px-3 pt-4 sm:px-4 sm:pt-6">
      <nav
        className="nebula-border relative flex w-full max-w-5xl items-center justify-between gap-x-3 rounded-[9999px] bg-black/60 py-2 pl-4 pr-2 sm:gap-x-8 sm:pl-6 shadow-2xl shadow-black/50 backdrop-blur-xl md:w-auto md:gap-12"
        style={{
          ['--nebula-border-gradient' as string]:
            'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.2))',
        }}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-[9999px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500">
          <span aria-hidden className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-orange-500 to-orange-700 font-nebula-tech text-[11px] font-bold text-white">
            F
          </span>
          <span className="font-nebula-ui text-sm font-medium tracking-tight text-white sm:text-base">
            CreatorFlow
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] rounded font-nebula-ui text-xs font-medium text-gray-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
            >
              {link.label}
            </Link>
          ))}
          {/* Not a Link: no public repository exists yet to point to — an
              inert, honestly-disabled item beats a link to nowhere. */}
          <span
            title="Repository isn't public yet"
            className="cursor-not-allowed font-nebula-ui text-xs font-medium text-gray-600"
          >
            GitHub
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/login"
            className="relative after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] hidden rounded font-nebula-ui text-xs font-medium text-gray-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 md:block"
          >
            Sign in
          </Link>

          <Link
            href="/onboarding"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-[9999px] p-px transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
          >
            <span
              aria-hidden
              className="nebula-beam absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ffffff_100%)] opacity-0 transition-opacity duration-300 [animation:nebulaBeamSpin_3s_linear_infinite] group-hover:opacity-100"
            />
            <span aria-hidden className="absolute inset-0 rounded-[9999px] bg-zinc-800 transition-opacity duration-300 group-hover:opacity-0" />
            <span className="relative flex h-full w-full items-center justify-center gap-2 rounded-[9999px] bg-gradient-to-b from-zinc-800 to-zinc-950 px-4 py-2.5 font-nebula-ui text-[11px] sm:px-6 sm:text-xs font-medium uppercase tracking-widest text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors duration-300 group-hover:text-white">
              <span className="relative z-10">Start free</span>
              <svg
                aria-hidden
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
