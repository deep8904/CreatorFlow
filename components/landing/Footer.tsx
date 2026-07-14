import Link from 'next/link'

const links = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
  ],
  App: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Deals', href: '/deals' },
    { label: 'Ideas', href: '/ideas' },
    { label: 'Analytics', href: '/analytics' },
  ],
  Company: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Status', href: '/status' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="font-label border-t border-white/10 bg-black py-24 text-[11px] uppercase tracking-wide text-ash">
      <div className="container-shell grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-12 lg:grid-cols-6">
        <div className="flex flex-col items-start gap-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" stroke="#F97316" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="#F97316" />
            </svg>
            <span className="font-sans text-base font-semibold uppercase tracking-tight text-white">CreatorFlow</span>
          </div>
          <p className="normal-case tracking-normal text-graphite">
            The free tool that helps content creators run the business side of their work.
          </p>
          <p>Never sold. Never trained on.</p>
        </div>

        {Object.entries(links).map(([group, items]) => (
          <div key={group} className="flex flex-col gap-4">
            <span className="mb-2 text-white">{group}</span>
            {items.map((item) => (
              <Link key={item.label} href={item.href} className="normal-case tracking-normal transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="container-shell mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
        <span>© {new Date().getFullYear()} CreatorFlow Inc.</span>
        <span>No cut taken. No lock-in. No nonsense.</span>
      </div>
    </footer>
  )
}
