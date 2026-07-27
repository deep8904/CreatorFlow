const SWATCHES = ['bg-orange-500', 'bg-orange-400', 'bg-amber-300', 'bg-zinc-400', 'bg-zinc-600']

export type BreakdownRow = { label: string; value: number; formatted: string }

/**
 * Proportional stacked bar + ranked legend — the honest analogue of the
 * reference's "Sales by Region" panel, here breaking down deal value by
 * brand rather than fabricating a country/region dimension CreatorFlow has
 * no data for.
 */
export function BreakdownList({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  const total = rows.reduce((acc, r) => acc + r.value, 0) || 1

  if (rows.length === 0) {
    return <p className="px-5 py-6 font-nebula-ui text-[12.5px] text-zinc-500">Nothing to break down yet.</p>
  }

  return (
    <div className="px-5 pb-4">
      <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">{title}</p>

      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-[9999px] bg-white/[0.05]" aria-hidden>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={SWATCHES[i % SWATCHES.length]}
            style={{ width: `${(r.value / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-center gap-2.5">
            <span aria-hidden className={`h-2 w-2 shrink-0 rounded-[9999px] ${SWATCHES[i % SWATCHES.length]}`} />
            <span className="min-w-0 flex-1 truncate font-nebula-ui text-[12.5px] text-zinc-300">{r.label}</span>
            <span className="shrink-0 font-nebula-mono text-[12px] text-zinc-500">
              {Math.round((r.value / total) * 100)}%
            </span>
            <span className="w-[64px] shrink-0 text-right font-nebula-mono text-[12px] font-medium text-zinc-100">
              {r.formatted}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BreakdownList
