import type { CSSProperties, ReactNode } from 'react'

// Renders a real "Connect" button when onConnect is provided (real Google
// OAuth credentials now exist), and falls back to the honest-disabled
// affordance with an explanatory note when it isn't — never a live button
// implying a working connection where none exists.
export function AuthConnectCard({
  icon,
  name,
  description,
  note,
  connected,
  connectedLabel,
  onConnect,
  connecting,
}: {
  icon: ReactNode
  name: string
  description: string
  note?: string
  connected?: boolean
  connectedLabel?: string
  onConnect?: () => void
  connecting?: boolean
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
          <p className="mt-1 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-500">
            {connected ? connectedLabel ?? description : description}
          </p>
        </div>
        <span
          className={`ml-auto shrink-0 rounded-[9999px] px-2.5 py-1 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.14em] ${
            connected ? 'bg-emerald-500/[0.12] text-emerald-300' : 'bg-white/[0.05] text-zinc-400'
          }`}
        >
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </div>
      {!connected &&
        (onConnect ? (
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="mt-5 flex h-11 w-full items-center justify-center rounded-[9999px] bg-white/[0.06] font-nebula-tech text-[12.5px] font-medium uppercase tracking-[0.12em] text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.1] disabled:pointer-events-none disabled:opacity-50"
          >
            {connecting ? 'Connecting…' : `Connect ${name}`}
          </button>
        ) : (
          <span
            aria-disabled="true"
            title={note}
            className="mt-5 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-[9999px] bg-white/[0.035] font-nebula-tech text-[12.5px] font-medium uppercase tracking-[0.12em] text-zinc-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
          >
            Connect {name}
          </span>
        ))}
      {note && !connected && <p className="mt-3 text-left font-nebula-ui text-[12px] leading-relaxed text-zinc-500">{note}</p>}
    </div>
  )
}
