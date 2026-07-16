import Footer from '@/components/landing/Footer'
import Features from '@/components/landing/Features'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import Nav from '@/components/landing/Nav'
import Problem from '@/components/landing/Problem'
import TrustBand from '@/components/landing/TrustBand'

export default function Home() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />
      <main>
        <Hero />
        <TrustBand />
        <Problem />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
