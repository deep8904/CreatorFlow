import Link from 'next/link'
import { FOCUS_INSET, HOVER } from './tokens'

export type DealRow = {
  id: string
  brand: string
  stage: string
  stageTone: 'default' | 'positive' | 'attention'
  value: string
  due: string | null
}

const TONE_CLASS: Record<DealRow['stageTone'], string> = {
  default: 'bg-white/[0.06] text-zinc-300',
  positive: 'bg-emerald-400/[0.12] text-emerald-300',
  attention: 'bg-orange-400/[0.14] text-orange-300',
}

/**
 * Dense data table — the reference's "Sales by Region" table pattern,
 * mapped to CreatorFlow's actual deal pipeline instead of a fabricated
 * region dimension.
 */
export function DealsTable({ rows, emptyMessage = 'No deals yet.' }: { rows: DealRow[]; emptyMessage?: string }) {
  if (rows.length === 0) {
    return <p className="px-5 py-6 font-nebula-ui text-[12.5px] text-zinc-500">{emptyMessage}</p>
  }

  return (
    <div className="console-scroll overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="px-5 py-2 text-left font-nebula-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Brand
            </th>
            <th className="px-3 py-2 text-left font-nebula-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Stage
            </th>
            <th className="px-3 py-2 text-left font-nebula-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Due
            </th>
            <th className="px-5 py-2 text-right font-nebula-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="group border-b border-white/[0.04] last:border-0">
              <td className="px-5 py-2.5">
                <Link
                  href={`/deals?deal=${r.id}`}
                  className={`font-nebula-ui text-[12.5px] font-medium text-zinc-100 hover:text-orange-300 ${HOVER} ${FOCUS_INSET} rounded-[4px]`}
                >
                  {r.brand}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex rounded-[9999px] px-2 py-0.5 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.06em] ${TONE_CLASS[r.stageTone]}`}>
                  {r.stage}
                </span>
              </td>
              <td className="px-3 py-2.5 font-nebula-ui text-[12px] text-zinc-500">{r.due ?? '—'}</td>
              <td className="px-5 py-2.5 text-right font-nebula-mono text-[12.5px] font-medium tabular-nums text-zinc-100">
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DealsTable
