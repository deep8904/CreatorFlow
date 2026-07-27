'use client'

import { useId, useState } from 'react'

export type TrendPoint = { label: string; value: number }

/**
 * Hand-rolled SVG line + gradient area, no charting dependency — matches
 * the project's existing convention (Analytics' bar trend is hand-rolled
 * divs too) and keeps full control over the glass/grain treatment DESIGN.md
 * asks for, which a generic chart library would fight.
 */
export function LineTrendChart({ points, unit }: { points: TrendPoint[]; unit?: string }) {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 600
  const height = 180
  const padX = 8
  const padY = 14

  if (points.length < 2) {
    return (
      <div className="flex h-[180px] items-center justify-center font-nebula-ui text-[12.5px] text-zinc-500">
        Not enough data yet to chart a trend.
      </div>
    )
  }

  const max = Math.max(...points.map((p) => p.value), 1)
  const min = Math.min(...points.map((p) => p.value), 0)
  const range = max - min || 1

  const stepX = (width - padX * 2) / (points.length - 1)
  const coords = points.map((p, i) => ({
    x: padX + i * stepX,
    y: padY + (1 - (p.value - min) / range) * (height - padY * 2),
    ...p,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`

  const active = hoverIndex !== null ? coords[hoverIndex] : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[180px] w-full touch-none"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const relX = ((e.clientX - rect.left) / rect.width) * width
          const idx = Math.round((relX - padX) / stepX)
          setHoverIndex(Math.min(Math.max(idx, 0), coords.length - 1))
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padY + f * (height - padY * 2)}
            y2={padY + f * (height - padY * 2)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="#fb923c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {active && (
          <>
            <line x1={active.x} x2={active.x} y1={padY} y2={height - padY} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
            <circle cx={active.x} cy={active.y} r={4} fill="#fb923c" stroke="#000" strokeWidth={2} />
          </>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-[8px] border border-white/10 bg-[#141416] px-2.5 py-1.5 font-nebula-mono text-[11px] text-zinc-200 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
          style={{ left: `${(active.x / width) * 100}%` }}
        >
          <span className="block text-zinc-500">{active.label}</span>
          <span className="block font-medium text-white">
            {active.value.toLocaleString()} {unit}
          </span>
        </div>
      )}

      <div className="mt-1 flex justify-between font-nebula-mono text-[10px] text-zinc-600">
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  )
}

export default LineTrendChart
