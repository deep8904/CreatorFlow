import Link from 'next/link'
import { FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import type { ViewCardItem, ViewCardTone } from './ViewCardItem'

const TONE_DOT: Record<ViewCardTone, string> = {
  default: 'bg-zinc-500',
  attention: 'bg-orange-400',
  positive: 'bg-emerald-400',
}

export function GalleryView({ items }: { items: ViewCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`nebula-border flex flex-col gap-2.5 rounded-[1.25rem] bg-white/[0.03] p-4 backdrop-blur-xl transition-colors hover:bg-white/[0.05] ${HOVER} ${FOCUS_INSET}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 flex-1 font-nebula-ui text-[13.5px] font-semibold leading-snug text-zinc-100">
              {item.title}
            </p>
            <span aria-hidden className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-[9999px] ${TONE_DOT[item.tone ?? 'default']}`} />
          </div>
          {item.preview && (
            <p className="line-clamp-3 font-nebula-ui text-[12px] leading-relaxed text-zinc-500">{item.preview}</p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
            {item.meta && (
              <span className="font-nebula-mono text-[10.5px] text-zinc-600">{item.meta}</span>
            )}
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-[9999px] border border-white/10 px-2 py-0.5 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.06em] text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default GalleryView
