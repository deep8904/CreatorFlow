/**
 * The one CreatorFlow mark: a geometric "F" (for Flow) built from three
 * sharp-cornered bars, framed by the brand's square device. Replaces 5
 * hand-copied inline SVGs (Nav, Footer, AppSidebar, Login, Onboarding)
 * that had drifted in strokeWidth (2.5 vs 2) and size (20x20 vs 24x24).
 *
 * Colour comes from `currentColor`, not a hardcoded hex. The mark
 * previously baked in `#000000`, which was correct under the white Swiss
 * ground but renders as an invisible black-on-black square on the Nebula
 * canvas. Inheriting the text colour lets one mark serve both systems
 * during the migration — set it with a text-* class at the call site.
 */
export function Logo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="2.5" />
      <rect x="8" y="7" width="2.2" height="10" fill="currentColor" />
      <rect x="8" y="7" width="9" height="2.2" fill="currentColor" />
      <rect x="8" y="11.4" width="6.4" height="2.2" fill="currentColor" />
    </svg>
  )
}
