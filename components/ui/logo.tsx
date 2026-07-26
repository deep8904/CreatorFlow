/**
 * The one CreatorFlow mark: a geometric "F" (for Flow) built from three
 * sharp-cornered bars, framed by the brand's square device. DESIGN.md
 * (2026-07-25 reset): same mark, same form, re-rendered in the system's
 * green accent instead of the retired orange. Replaces 5 hand-copied inline
 * SVGs (Nav, Footer, AppSidebar, Login, Onboarding) that had drifted in
 * strokeWidth (2.5 vs 2) and size (20x20 vs 24x24).
 */
export function Logo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" stroke="#22C55E" strokeWidth="2.5" />
      <rect x="8" y="7" width="2.2" height="10" fill="#22C55E" />
      <rect x="8" y="7" width="9" height="2.2" fill="#22C55E" />
      <rect x="8" y="11.4" width="6.4" height="2.2" fill="#22C55E" />
    </svg>
  )
}
