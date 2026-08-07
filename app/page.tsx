import type { Metadata } from 'next'
import { NebulaNav } from '@/components/home/NebulaNav'
import { Hero } from '@/components/home/Hero'
import { StackMarquee } from '@/components/home/StackMarquee'
import { FeatureShowcase } from '@/components/home/FeatureShowcase'
import { GhostSection } from '@/components/home/GhostSection'
import { DetailCards } from '@/components/home/DetailCards'
import { FeatureBento } from '@/components/home/FeatureBento'
import { HomeFooter } from '@/components/home/HomeFooter'

export const metadata: Metadata = {
  title: 'CreatorFlow: Fewer dropped ideas. More consistent you.',
  description:
    'Free and open source. Every idea captured before it slips away, every brand deal tracked from first email to paid, and a clear read on what is actually working.',
}

/**
 * Home page — Nebula system (DESIGN.md, 2026-07-25).
 *
 * Built from scratch against the supplied Nebula reference. Nothing here
 * reuses the previous landing components (`components/landing/*`), which
 * stay in place untouched until the remaining routes are redesigned too.
 *
 * The page carries its own black canvas rather than inheriting the global
 * token layer, so this dark world and the in-app product's current tokens
 * coexist without either corrupting the other.
 *
 * No pricing section, link, or CTA anywhere — the product is open source.
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white antialiased selection:bg-orange-500/30 selection:text-orange-200">
      {/* Progressive blur stack sitting behind the floating nav */}
      <div aria-hidden className="nebula-progressive-blur">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>

      <NebulaNav />

      <main className="flex flex-col items-center">
        <Hero />
        <StackMarquee />
        <FeatureShowcase />
        <GhostSection />
        <DetailCards />
        <FeatureBento />
        <HomeFooter />
      </main>
    </div>
  )
}
