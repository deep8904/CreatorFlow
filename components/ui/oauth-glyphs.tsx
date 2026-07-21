/**
 * Gmail/YouTube glyphs, monochrome (currentColor) so they inherit color
 * from a wrapping text-* class instead of hardcoding stroke="#18181B" —
 * and share one strokeWidth instead of drifting (1.3 in Settings vs 1.5
 * in Onboarding for the same glyph).
 */
const STROKE_WIDTH = 1.4

export function GmailGlyph({ size = 18 }: { size?: number }) {
  const height = Math.round(size * (14 / 18))
  return (
    <svg width={size} height={height} viewBox="0 0 18 14" fill="none">
      <rect width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} />
      <path d="M2 3l7 5 7-5" stroke="currentColor" strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
    </svg>
  )
}

export function YouTubeGlyph({ size = 18 }: { size?: number }) {
  const height = Math.round(size * (13 / 18))
  return (
    <svg width={size} height={height} viewBox="0 0 18 13" fill="none">
      <rect width="18" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth={STROKE_WIDTH} />
      <path d="M7 4l6 2.5-6 2.5V4z" fill="currentColor" />
    </svg>
  )
}
