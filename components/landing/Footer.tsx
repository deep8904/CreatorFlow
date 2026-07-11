import Link from 'next/link'

const links = {
  Product: [
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
  Support: [
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
    <footer className="bg-carbon py-16 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 md:gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-4 md:w-56 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-lavender flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5h8M6.5 2.5l4 4-4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-paper-white" style={{ letterSpacing: '-0.3px' }}>
                CreatorFlow
              </span>
            </Link>
            <p className="text-[13px] text-ash leading-relaxed" style={{ letterSpacing: '-0.2px' }}>
              The free tool that helps content creators run the business side of their work.
            </p>
            <p className="text-[12px]" style={{ color: '#555566', letterSpacing: '-0.2px' }}>
              We never sell your data or train models on your inbox.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(links).map(([group, items]) => (
              <div key={group} className="flex flex-col gap-3">
                <p
                  className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: '#555566' }}
                >
                  {group}
                </p>
                {items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[13px] text-ash hover:text-paper-white transition-colors"
                    style={{ letterSpacing: '-0.2px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid #2a2b38' }}
        >
          <p className="text-[12px]" style={{ color: '#555566', letterSpacing: '-0.2px' }}>
            © {new Date().getFullYear()} CreatorFlow. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: '#555566', letterSpacing: '-0.2px' }}>
            No cut taken. No lock-in. No nonsense.
          </p>
        </div>
      </div>
    </footer>
  )
}
