'use client'

import Link from 'next/link'
import { FOCUS, HOVER } from './tokens'

/**
 * Group-level error boundary for every `(app)` screen.
 *
 * No red alarm slab — a failed load is recoverable. lib/supabase/queries.ts
 * throws on a genuine Supabase error (as opposed to a legitimate empty
 * result), which is what actually lands here. `error.message` never renders
 * in production; a raw error string can leak query shape.
 */
export function DashError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-black px-4 text-center">
      <div role="alert" className="max-w-[26rem]">
        <p className="font-nebula-heading text-[17px] font-semibold text-white">Something went wrong</p>
        <p className="mt-2 font-nebula-ui text-[13.5px] leading-relaxed text-zinc-500">
          We couldn&apos;t load this screen. Nothing was lost. Try again.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className={`inline-flex h-9 items-center rounded-[9999px] border border-white/10 bg-white/[0.04] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-200 hover:bg-white/[0.08] ${HOVER} ${FOCUS}`}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className={`inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-500 hover:text-white ${HOVER} ${FOCUS}`}
          >
            Go to dashboard
          </Link>
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="console-scroll mt-7 max-h-40 overflow-auto rounded-[10px] border border-white/[0.08] bg-white/[0.02] p-3.5 text-left font-nebula-mono text-[11px] text-zinc-500">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}

export default DashError
