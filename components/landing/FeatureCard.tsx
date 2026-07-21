import type { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  heading: string
  body: string
  invert?: boolean
}

export default function FeatureCard({ icon, heading, body, invert = false }: FeatureCardProps) {
  return (
    <div
      className={`hover-lift-editorial group flex aspect-square flex-col p-8 lg:p-10 ${
        invert ? 'relative overflow-hidden bg-lavender text-black' : ''
      }`}
    >
      <div className={`relative z-10 mb-auto ${invert ? 'text-black' : 'text-lavender'}`}>{icon}</div>
      <div className="relative z-10">
        <h3 className={`mb-2.5 text-lg font-semibold ${invert ? 'text-black' : 'text-carbon'}`}>{heading}</h3>
        <p className={`font-body-editorial text-sm leading-relaxed ${invert ? 'text-black/70' : 'text-graphite'}`}>{body}</p>
      </div>
    </div>
  )
}
