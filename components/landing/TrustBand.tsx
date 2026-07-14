import MetricCounter from '@/components/editorial/MetricCounter'
import RevealUp from '@/components/editorial/RevealUp'

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
          <p className="label-eyebrow mb-10 justify-center text-center">Built for serious creators at every stage</p>
        </RevealUp>

        <RevealUp delay={1}>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-white">
                <MetricCounter target={12} suffix="K+" />
              </span>
              <span className="text-[13px] text-graphite">Creators using CreatorFlow</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-white">$0</span>
              <span className="text-[13px] text-graphite">Taken from your deals</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-white">2 min</span>
              <span className="text-[13px] text-graphite">To get set up</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-3xl font-semibold tracking-tighter text-white">
                <MetricCounter target={100} suffix="%" />
              </span>
              <span className="text-[13px] text-graphite">Data ownership — always</span>
            </div>
          </div>
        </RevealUp>

        <RevealUp delay={2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {pills.map((pill) => (
              <span
                key={pill.label}
                className={`font-label inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-wide ${
                  pill.invert ? 'border-lavender bg-lavender text-black' : 'border-fog text-graphite'
                }`}
              >
                {pill.label}
              </span>
            ))}
          </div>
        </RevealUp>
      </div>
    </section>
  )
}
