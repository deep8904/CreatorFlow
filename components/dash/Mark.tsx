/**
 * Brand mark for the dashboard tier — the real logo asset
 * (public/brand/logo-mark.png), not a hand-drawn CSS chip. The icon's holes
 * are baked in as solid white (not transparent), so it reads correctly
 * against any background, dark sidebar included.
 */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <img
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 drop-shadow-[0_2px_10px_-2px_rgba(234,88,12,0.65)]"
    />
  )
}

export default Mark
