/**
 * The grid-curtain background (DESIGN.md → Elevation & Depth → "Grid
 * Curtains"): seven full-height columns, each revealing top-to-bottom via
 * a `clip-path` inset animation on a staggered delay, producing a shutter
 * effect on load.
 *
 * The stepped black plinths at the bottom of each column give the hero a
 * skyline silhouette that rises toward the centre, framing the headline.
 */

/** Plinth height per column — tallest at the edges, lowest at the centre. */
const COLUMNS = [
  { height: '75%', delay: 'nebula-delay-1', edge: 'right' },
  { height: '65%', delay: 'nebula-delay-2', edge: 'right' },
  { height: '55%', delay: 'nebula-delay-3', edge: 'right' },
  { height: '45%', delay: 'nebula-delay-4', edge: 'centre' },
  { height: '55%', delay: 'nebula-delay-5', edge: 'left' },
  { height: '65%', delay: 'nebula-delay-6', edge: 'left' },
  { height: '75%', delay: 'nebula-delay-7', edge: 'left' },
] as const

export function HeroCurtain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full grid-cols-1 md:grid md:grid-cols-7"
      /* Fade the curtain out toward the top: the stepped plinths are meant to
         read as a skyline along the bottom edge, but at full strength their
         hard vertical borders cut straight through the headline. */
      style={{
        maskImage: 'linear-gradient(to top, black 35%, transparent 90%)',
        WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 90%)',
      }}
    >
      {COLUMNS.map((col, i) => (
        <div
          key={i}
          className={`nebula-col relative h-full ${col.delay} ${
            col.edge === 'centre'
              ? 'border-r border-white/5 md:border-none'
              : col.edge === 'right'
                ? 'hidden border-r border-white/5 md:block'
                : 'hidden border-l border-white/5 md:block'
          }`}
        >
          <div
            className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.8)]"
            style={{ height: col.height }}
          />
          {col.edge === 'centre' && (
            <div className="pointer-events-none absolute inset-x-0 top-[20%] h-[30%] bg-gradient-to-b from-white/5 to-transparent" />
          )}
        </div>
      ))}
    </div>
  )
}
