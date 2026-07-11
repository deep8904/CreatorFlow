const stats = [
  { value: '12K+', label: 'Creators using CreatorFlow' },
  { value: '$0', label: 'Taken from your deals' },
  { value: '2 min', label: 'To get set up' },
  { value: '100%', label: 'Data ownership — always' },
]

export default function TrustBand() {
  return (
    <section className="bg-linen border-y border-fog py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <p
          className="text-center text-[11.5px] font-semibold text-ash uppercase tracking-widest mb-10"
        >
          Built for serious creators at every stage
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1.5">
              <span
                className="font-bold text-carbon"
                style={{ fontSize: '32px', lineHeight: 1, letterSpacing: '-0.06em' }}
              >
                {s.value}
              </span>
              <span className="text-[13px] text-graphite" style={{ letterSpacing: '-0.2px' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {[
            { label: 'Gmail integration', color: 'bg-sky/10 text-sky' },
            { label: 'YouTube analytics', color: 'bg-mint-wash text-mint' },
            { label: 'AI contract review', color: 'bg-lavender/10 text-lavender' },
            { label: 'Team access', color: 'bg-amber/10 text-amber' },
            { label: 'Full data export', color: 'bg-fog text-graphite' },
            { label: 'No deal cut', color: 'bg-carbon text-paper-white' },
          ].map((pill) => (
            <span
              key={pill.label}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[12.5px] font-medium ${pill.color}`}
              style={{ letterSpacing: '-0.2px' }}
            >
              {pill.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
