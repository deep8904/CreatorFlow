import Link from 'next/link'
import { FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import type { ViewCardItem, ViewCardTone } from './ViewCardItem'

const TONE_DOT: Record<ViewCardTone, string> = {
  default: 'bg-zinc-500',
  attention: 'bg-orange-400',
  positive: 'bg-emerald-400',
}

export function TableView({ items }: { items: ViewCardItem[] }) {
  return (
    <div className="nebula-border overflow-hidden rounded-[1.25rem] bg-white/[0.03] backdrop-blur-xl">
      <div className="divide-y divide-white/[0.06]">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${HOVER} ${FOCUS_INSET} hover:bg-white/[0.04]`}
          >
            <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-[9999px] ${TONE_DOT[item.tone ?? 'default']}`} />
            <span className="min-w-0 flex-1 truncate font-nebula-ui text-[13px] font-medium text-zinc-100">{item.title}</span>
            {item.tags && item.tags.length > 0 && (
              <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[9999px] border border-white/10 px-2 py-0.5 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.06em] text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            )}
            {item.meta && (
              <span className="shrink-0 whitespace-nowrap font-nebula-mono text-[11px] text-zinc-500">{item.meta}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TableView
