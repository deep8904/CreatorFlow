import type { CSSProperties, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export type Metric = {
  label: string
  value: string
  hint?: string
  title?: string
  delta?: { pct: number; positive: boolean } | null
  icon?: ReactNode
}

function DeltaChip({ delta }: { delta: NonNullable<Metric['delta']> }) {
  const Icon = delta.positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-[9999px] px-1.5 py-0.5 font-nebula-mono text-[10.5px] font-medium ${
        delta.positive ? 'bg-emerald-400/[0.12] text-emerald-300' : 'bg-rose-400/[0.12] text-rose-300'
      }`}
    >
      <Icon size={10} strokeWidth={2.5} />
      {Math.abs(delta.pct).toFixed(0)}%
    </span>
  )
}

export function MetricCard({ label, value, hint, title, delta, icon, className = '' }: Metric & { className?: string }) {
  return (
    <div
      className={`nebula-border relative flex flex-col justify-center overflow-hidden rounded-[1.25rem] bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5 ${className}`}
      style={
        {
          '--nebula-border-gradient':
            'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02) 50%, rgba(234,88,12,0.08))',
        } as CSSProperties
      }
    >
      {/* One badge slot, always top-right: the delta when this metric has a
          trend, the category icon otherwise — never both, so every card in
          the grid keeps its status indicator in the same place. */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {label}
        </p>
        {delta ? <DeltaChip delta={delta} /> : icon ? <span aria-hidden className="text-orange-400/80">{icon}</span> : null}
      </div>
      <p
        title={title}
        className="mt-2 font-nebula-mono text-[24px] font-medium tabular-nums tracking-[-0.02em] text-white sm:text-[26px]"
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 truncate font-nebula-ui text-[11.5px] text-zinc-500">{hint}</p>}
    </div>
  )
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  )
}

export default MetricGrid
