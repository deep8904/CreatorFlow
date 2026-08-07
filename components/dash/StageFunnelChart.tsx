export type StageBar = { label: string; count: number; value: number }
export type PaidSummary = { count: number; formattedValue: string }

const TICKS = 14

/**
 * Deal-stage funnel — the honest CreatorFlow analogue of the reference's
 * ecommerce conversion funnel (leads → cart → checkout). Each stage is a
 * horizontal segmented fill bar (ticks lit up to its share of the largest
 * stage) rather than a decorative ascending bar shape — the tick count lit
 * *is* the percentage, not a sparkline standing in for one.
 *
 * Paid renders as its own terminal-state row rather than a 5th grid column —
 * it's a closed deal, not a stage still moving through the pipeline, and a
 * 5-item set never divided evenly into the 4-column grid the other stages
 * use (it fell alone onto a second row at `sm:` and up).
 */
export function StageFunnelChart({ stages, paid }: { stages: StageBar[]; paid: PaidSummary }) {
  const base = stages[0]?.count || 1

  return (
    <div>
      <p className="mb-2.5 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-600">
        Active pipeline
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stages.map((s) => {
          const pct = base === 0 ? 0 : Math.round((s.count / base) * 100)
          const litTicks = Math.round((pct / 100) * TICKS)
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-[10px] bg-white/[0.02] p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-nebula-mono text-[15px] font-medium tabular-nums text-white">{pct}%</p>
                <p className="font-nebula-mono text-[11px] text-zinc-500">{s.count}</p>
              </div>
              <div className="flex h-2 w-full items-center gap-[2.5px]" aria-hidden>
                {Array.from({ length: TICKS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-[1px] ${i < litTicks ? 'bg-orange-500' : 'bg-white/[0.08]'}`}
                  />
                ))}
              </div>
              <p className="font-nebula-ui text-[11.5px] font-medium text-zinc-300">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-[10px] border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-[9999px] bg-emerald-400" />
          <p className="font-nebula-ui text-[12px] font-medium text-emerald-200">
            Paid <span className="text-emerald-300/70">· closed</span>
          </p>
        </div>
        <p className="font-nebula-mono text-[12.5px] font-medium tabular-nums text-emerald-200">
          {paid.count} {paid.count === 1 ? 'deal' : 'deals'} · {paid.formattedValue}
        </p>
      </div>
    </div>
  )
}

export default StageFunnelChart
