/**
 * Brand mark for the dashboard tier. Uses `currentColor`-free direct fill
 * (not `components/ui/logo.tsx`, which is scoped to the marketing/auth
 * wordmark lockup) — a compact chip form factor for a nav rail.
 */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-[9px] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_2px_10px_-2px_rgba(234,88,12,0.65)]"
    >
      <span
        className="absolute inset-0 opacity-60"
        style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 55%)' }}
      />
      <span className="relative font-nebula-tech text-[12px] font-bold tracking-tight text-white">F</span>
    </span>
  )
}

export default Mark
