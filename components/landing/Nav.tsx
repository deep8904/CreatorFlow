'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

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
          <Logo size={22} className="transition-transform duration-500 ease-out group-hover:rotate-90" />
          <span className="font-sans text-[15px] font-semibold uppercase tracking-tight text-carbon">
            CreatorFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13.5px] font-medium text-graphite transition-colors hover:text-carbon"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/login" className="text-[13.5px] font-medium text-graphite transition-colors hover:text-carbon">
            Log in
          </Link>
          <Button href="/onboarding" size="sm" iconRight={<ArrowUpRight size={13} />}>
            Start free
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-full p-2 text-carbon transition-colors hover:bg-mist md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-fog bg-paper-white px-6 py-4 md:hidden">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2.5 text-[14px] font-medium text-carbon transition-colors hover:text-lavender"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <hr className="my-2 border-fog" />
          <Link href="/login" className="py-2 text-[14px] font-medium text-graphite">
            Log in
          </Link>
          <Button href="/onboarding" size="sm" className="mt-1 w-full py-2.5 text-[14px]" onClick={() => setMobileOpen(false)}>
            Start free
          </Button>
        </div>
      )}
    </header>
  )
}
