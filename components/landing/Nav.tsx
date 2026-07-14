'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="glass-panel fixed top-0 z-50 w-full">
      <div className="container-shell flex h-[4.5rem] items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-transform duration-500 ease-out group-hover:rotate-90"
          >
            <rect x="2" y="2" width="20" height="20" stroke="#F97316" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="4" fill="#F97316" />
          </svg>
          <span className="font-sans text-[15px] font-semibold uppercase tracking-tight text-white">
            CreatorFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13.5px] font-medium text-graphite transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/login" className="text-[13.5px] font-medium text-graphite transition-colors hover:text-white">
            Log in
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 border border-lavender/40 px-4 py-2 font-label text-[11px] uppercase tracking-widest text-white transition-all hover:bg-lavender hover:text-black"
          >
            Start free
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-white/10 bg-black px-6 py-4 md:hidden">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2.5 text-[14px] font-medium text-white transition-colors hover:text-lavender"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <hr className="my-2 border-white/10" />
          <Link href="/login" className="py-2 text-[14px] font-medium text-graphite">
            Log in
          </Link>
          <Link
            href="/onboarding"
            className="mt-1 bg-lavender px-4 py-2.5 text-center text-[14px] font-semibold text-black"
          >
            Start free
          </Link>
        </div>
      )}
    </header>
  )
}
