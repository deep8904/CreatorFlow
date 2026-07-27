import type { CSSProperties, ReactNode } from 'react'

// Honest by construction: no real Google OAuth credentials exist in this build, so the
// "Connect" affordance always renders disabled with a note explaining why — never a live
// button implying a working connection.
export function AuthConnectCard({
  icon,
  name,
  description,
  note,
}: {
  icon: ReactNode
  name: string
  description: string
  note: string
}) {
  return (
    <div
      className="nebula-border relative overflow-hidden rounded-[1rem] bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6"
      style={
        {
          '--nebula-border-gradient': 'linear-gradient(155deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 55%, rgba(234,88,12,0.10))',
        } as CSSProperties
      }
    >
      <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-white/[0.06] text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          {icon}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-nebula-ui text-[14px] font-medium tracking-[-0.01em] text-zinc-100">{name}</p>
          <p className="mt-1 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-500">{description}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-[9999px] bg-white/[0.05] px-2.5 py-1 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-400">
          Not connected
        </span>
      </div>
      <span
        aria-disabled="true"
        title="Connecting a real account requires production Google OAuth credentials"
        className="mt-5 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-[9999px] bg-white/[0.035] font-nebula-tech text-[12.5px] font-medium uppercase tracking-[0.12em] text-zinc-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
      >
        Connect {name}
      </span>
      <p className="mt-3 text-left font-nebula-ui text-[12px] leading-relaxed text-zinc-500">{note}</p>
    </div>
  )
}
