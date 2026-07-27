import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { FOCUS, HOVER } from './tokens'

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
      <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
        <Sparkles size={18} strokeWidth={2} />
      </span>
      <div>
        <p className="font-nebula-heading text-[16px] font-semibold text-white">Nothing here yet.</p>
        <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">
          Log a deal or capture an idea and this dashboard fills in.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          href="/deals?new=1"
          className={`nebula-cta nebula-cta--wide inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
        >
          <span className="nebula-cta__label">Log a deal</span>
        </Link>
        <Link
          href="/ideas?new=1"
          className={`flex h-9 items-center rounded-[9999px] border border-white/10 px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
        >
          Capture an idea
        </Link>
      </div>
    </div>
  )
}

export default EmptyDashboard
