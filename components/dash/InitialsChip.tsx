const PALETTE = [
  'bg-orange-500/20 text-orange-300',
  'bg-sky-500/20 text-sky-300',
  'bg-violet-500/20 text-violet-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-rose-500/20 text-rose-300',
  'bg-amber-500/20 text-amber-300',
]

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function InitialsChip({ name, size = 32 }: { name: string; size?: number }) {
  const cls = PALETTE[hashStr(name) % PALETTE.length]
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`grid shrink-0 place-items-center rounded-[9999px] font-nebula-mono font-semibold ${cls}`}
    >
      {initialsFor(name)}
    </span>
  )
}

export default InitialsChip
