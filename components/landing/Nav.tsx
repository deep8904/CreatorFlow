'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="w-full bg-paper-white border-b border-fog sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-lavender flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5h8M6.5 2.5l4 4-4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
            CreatorFlow
          </span>
        </Link>

        {/* Desktop nav — centered pill */}
        <nav className="hidden md:flex items-center gap-0.5 bg-mist rounded-full px-1.5 py-1">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '/pricing' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13.5px] font-medium text-graphite hover:text-carbon px-4 py-1.5 rounded-full hover:bg-paper-white transition-all"
              style={{ letterSpacing: '-0.25px' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-graphite hover:text-carbon px-3 py-2 transition-colors"
            style={{ letterSpacing: '-0.25px' }}
          >
            Log in
          </Link>
          <Link
            href="/onboarding"
            className="text-[13.5px] font-medium text-paper-white bg-lavender px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{
              letterSpacing: '-0.25px',
              boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px',
            }}
          >
            Get started free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-carbon rounded-lg hover:bg-mist transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-fog bg-paper-white px-6 py-4 flex flex-col gap-1">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '/pricing' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[14px] font-medium text-carbon py-2.5 hover:text-lavender transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-fog my-2" />
          <Link href="/login" className="text-[14px] font-medium text-graphite py-2">Log in</Link>
          <Link
            href="/onboarding"
            className="text-[14px] font-medium text-paper-white bg-lavender px-4 py-2.5 rounded-full text-center mt-1"
          >
            Get started free
          </Link>
        </div>
      )}
    </header>
  )
}
