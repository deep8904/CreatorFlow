import Footer from '@/components/landing/Footer'
import Features from '@/components/landing/Features'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import LandingPricing from '@/components/landing/LandingPricing'
import Nav from '@/components/landing/Nav'
import TrustBand from '@/components/landing/TrustBand'

export default function Home() {
  return (
    <div className="min-h-screen bg-paper-white">
      <Nav />
      <main>
        <Hero />
        <TrustBand />
        <Features />
        <HowItWorks />
        <LandingPricing />
      </main>
      <Footer />
    </div>
  )
}
