import Link from 'next/link'
import { FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import type { ViewCardItem, ViewCardTone } from './ViewCardItem'

const TONE_DOT: Record<ViewCardTone, string> = {
  default: 'bg-zinc-500',
  attention: 'bg-orange-400',
  positive: 'bg-emerald-400',
}

export type BoardColumn = {
  key: string
  label: string
  items: ViewCardItem[]
}

export function BoardView({ columns }: { columns: BoardColumn[] }) {
  return (
    <div className="console-scroll flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full gap-3" style={{ minWidth: 'max-content' }}>
        {columns.map((col) => (
          <div key={col.key} className="flex w-[260px] shrink-0 flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-nebula-heading text-[12.5px] font-semibold text-zinc-200">{col.label}</span>
              <span className="rounded-[9999px] bg-white/[0.06] px-2 py-0.5 font-nebula-mono text-[10.5px] font-medium text-zinc-500">
                {col.items.length}
              </span>
            </div>
            <div className="console-scroll flex flex-1 flex-col gap-2 overflow-y-auto pb-2 pr-0.5">
              {col.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nebula-border flex flex-col gap-1.5 rounded-[14px] bg-white/[0.03] p-3.5 text-left backdrop-blur-xl transition-colors hover:bg-white/[0.05] ${HOVER} ${FOCUS_INSET}`}
                >
                  <div className="flex items-start gap-2">
                    <span aria-hidden className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[9999px] ${TONE_DOT[item.tone ?? 'default']}`} />
                    <p className="min-w-0 flex-1 font-nebula-ui text-[12.5px] font-medium leading-snug text-zinc-100">
                      {item.title}
                    </p>
                  </div>
                  {item.preview && (
                    <p className="line-clamp-2 font-nebula-ui text-[11px] leading-snug text-zinc-500">{item.preview}</p>
                  )}
                  {item.meta && <p className="font-nebula-mono text-[10.5px] text-zinc-600">{item.meta}</p>}
                </Link>
              ))}
              {col.items.length === 0 && (
                <div className="rounded-[14px] border border-dashed border-white/10 p-3.5 text-center">
                  <p className="font-nebula-ui text-[11.5px] text-zinc-600">Nothing here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BoardView
