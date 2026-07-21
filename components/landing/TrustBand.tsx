import MetricCounter from '@/components/editorial/MetricCounter'
import RevealUp from '@/components/editorial/RevealUp'
import { Badge } from '@/components/ui/badge'

const pills = [
  { label: 'Gmail integration' },
  { label: 'YouTube analytics' },
  { label: 'AI contract review' },
  { label: 'Team access' },
  { label: 'Full data export' },
  { label: 'No deal cut', invert: true },
]

export default function TrustBand() {
  return (
    <section className="border-y border-fog bg-mist/40 py-16">
      <div className="container-shell">
        <RevealUp>
          <p className="label-eyebrow mb-10 justify-center text-center">Just launched, built for one thing</p>
        </RevealUp>

        <RevealUp delay={1}>
          <div className="grid grid-cols-3 gap-10">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-carbon">$0</span>
              <span className="text-[13px] text-graphite">Taken from your deals</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-carbon">2 min</span>
              <span className="text-[13px] text-graphite">To get set up</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-carbon">
                <MetricCounter target={100} suffix="%" />
              </span>
              <span className="text-[13px] text-graphite">Data ownership — always</span>
            </div>
          </div>
        </RevealUp>

        <RevealUp delay={2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {pills.map((pill) => (
              <Badge key={pill.label} variant={pill.invert ? 'filled' : 'outline'}>
                {pill.label}
              </Badge>
            ))}
          </div>
        </RevealUp>
      </div>
    </section>
  )
}
