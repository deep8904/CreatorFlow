/**
 * Semicircular SVG gauge — arc length encodes `pct`, matching the reference's
 * "Sessions" gauge structurally, restyled in the orange/glass language.
 */
export function GaugeChart({
  pct,
  value,
  label,
}: {
  pct: number
  value: string
  label: string
}) {
  const clamped = Math.min(Math.max(pct, 0), 100)
  const radius = 70
  const circumference = Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#fb923c"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="-mt-8 flex flex-col items-center">
        <p className="font-nebula-mono text-[24px] font-medium tabular-nums text-white">{value}</p>
        <p className="mt-0.5 font-nebula-ui text-[11.5px] text-zinc-400">{label}</p>
      </div>
    </div>
  )
}

export default GaugeChart
