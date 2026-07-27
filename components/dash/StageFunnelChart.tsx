export type StageBar = { label: string; count: number; value: number }

/**
 * Deal-stage funnel — the honest CreatorFlow analogue of the reference's
 * ecommerce conversion funnel (leads → cart → checkout). Bars scale to the
 * first (largest) stage, each labelled with its own share of that stage.
 */
export function StageFunnelChart({ stages }: { stages: StageBar[] }) {
  const base = stages[0]?.count || 1

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stages.map((s) => {
        const pct = base === 0 ? 0 : Math.round((s.count / base) * 100)
        return (
          <div key={s.label} className="flex flex-col">
            <p className="font-nebula-mono text-[15px] font-medium tabular-nums text-white">{pct}%</p>
            <div className="mt-2 flex h-16 items-end gap-[3px]" aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-[2px] ${
                    i < Math.round((pct / 100) * 8) ? 'bg-orange-500' : 'bg-white/[0.06]'
                  }`}
                  style={{ height: `${20 + i * 10}%` }}
                />
              ))}
            </div>
            <p className="mt-2 font-nebula-ui text-[11.5px] font-medium text-zinc-300">{s.label}</p>
            <p className="font-nebula-mono text-[11px] text-zinc-500">{s.count}</p>
          </div>
        )
      })}
    </div>
  )
}

export default StageFunnelChart
