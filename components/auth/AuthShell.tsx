import type { ReactNode } from 'react'
import Link from 'next/link'
import { Mark } from '@/components/dash/Mark'
import { FOCUS } from '@/components/dash/tokens'

const CURTAIN_COLUMNS = [
  { height: '46%', delay: 'nebula-delay-1' },
  { height: '30%', delay: 'nebula-delay-2' },
  { height: '46%', delay: 'nebula-delay-3' },
]

// Server-renderable — no hooks, no 'use client'. accept-invite/page.tsx renders this
// directly from a Server Component; the four client-side auth pages render it from
// inside their own 'use client' boundary. Both work without a directive here.
export function AuthShell({
  width = 'narrow',
  topRight,
  footnote,
  children,
}: {
  width?: 'narrow' | 'wide'
  topRight?: ReactNode
  footnote?: ReactNode
  children: ReactNode
}) {
  const maxWidth = width === 'wide' ? 'max-w-[30rem]' : 'max-w-[25rem]'

  return (
    <div className="nebula-auth relative flex min-h-[100svh] w-full flex-col overflow-x-hidden bg-black font-nebula-ui text-zinc-200 antialiased selection:bg-orange-500/30 selection:text-orange-200">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="nebula-grain absolute inset-0" />
        <div className="absolute left-1/2 top-[-22%] h-[75%] w-[150%] -translate-x-1/2 rounded-[9999px] bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.12),rgba(234,88,12,0.04)_38%,transparent_70%)] blur-[60px]" />
        <div
          className="absolute inset-0 z-0 hidden md:grid md:grid-cols-3"
          style={{
            maskImage: 'linear-gradient(to top, black 25%, transparent 78%)',
            WebkitMaskImage: 'linear-gradient(to top, black 25%, transparent 78%)',
          }}
        >
          {CURTAIN_COLUMNS.map((col, i) => (
            <div key={col.delay} className={`nebula-col relative h-full ${col.delay} ${i > 0 ? 'border-l border-white/[0.04]' : ''}`}>
              <div
                className="absolute inset-x-0 bottom-0 border-t border-white/[0.08] bg-black shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]"
                style={{ height: col.height }}
              />
            </div>
          ))}
        </div>
        <p className="absolute inset-0 hidden select-none items-center justify-center whitespace-nowrap text-center font-nebula-heading text-[13vw] font-extrabold tracking-tighter text-white/[0.018] xl:flex">
          CREATORFLOW
        </p>
      </div>

      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link href="/" className={`group -my-2 inline-flex shrink-0 items-center gap-2.5 rounded-[10px] py-2 ${FOCUS}`}>
          <Mark size={24} />
          <span className="font-nebula-ui text-[15px] font-medium tracking-tight text-white">CreatorFlow</span>
        </Link>
        {topRight && <div className="flex min-w-0 shrink items-center">{topRight}</div>}
        <div aria-hidden className="console-rule-x absolute inset-x-0 bottom-0 opacity-60" />
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-start px-4 py-8 sm:px-6 md:justify-center md:py-12 lg:py-16">
        <div className={`mx-auto w-full text-center ${maxWidth}`}>{children}</div>
      </main>

      {footnote && (
        <p className="relative z-10 mx-auto mb-8 max-w-[34ch] px-4 text-center font-nebula-ui text-[12px] leading-relaxed text-zinc-500 sm:px-6">
          {footnote}
        </p>
      )}
    </div>
  )
}
