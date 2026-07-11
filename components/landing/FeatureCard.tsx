interface FeatureCardProps {
  icon: React.ReactNode
  heading: string
  body: string
  accent?: string
}

export default function FeatureCard({ icon, heading, body, accent = 'bg-lavender' }: FeatureCardProps) {
  return (
    <div
      className="bg-paper-white border border-fog rounded-2xl p-6 flex flex-col gap-4"
      style={{ boxShadow: 'rgba(0,0,0,0.03) 0px 1px 2px 0px' }}
    >
      <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <h3
          className="font-semibold text-carbon mb-1.5"
          style={{ fontSize: '15px', lineHeight: 1.4, letterSpacing: '-0.3px' }}
        >
          {heading}
        </h3>
        <p
          className="text-graphite"
          style={{ fontSize: '14px', lineHeight: 1.55, letterSpacing: '-0.2px' }}
        >
          {body}
        </p>
      </div>
    </div>
  )
}
