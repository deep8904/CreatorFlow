/**
 * Interactive hero typography (DESIGN.md → Components → "Interactive
 * Header"): each character sits in an `overflow-hidden` box with a second
 * copy parked one line below. Hovering the phrase rolls the white glyph up
 * and the orange one into its place, staggered 25ms per character.
 *
 * Purely decorative — the text is present and legible without the hover,
 * and the whole effect collapses under `prefers-reduced-motion`.
 */
export function RollPhrase({ text }: { text: string }) {
  const words = text.split(' ')
  let charIndex = 0

  return (
    <span className="group inline-flex cursor-pointer select-none flex-wrap justify-center gap-x-[0.25em]">
      {words.map((word) => (
        <span key={word} className="inline-flex">
          {Array.from(word).map((char, i) => {
            const delay = `${charIndex++ * 25}ms`
            return (
              <span key={`${word}-${i}`} className="relative inline-block h-[1.1em] overflow-hidden">
                <span
                  className="block bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  style={{ transitionDelay: delay }}
                >
                  {char}
                </span>
                <span
                  aria-hidden
                  className="absolute left-0 top-0 block translate-y-full text-orange-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 motion-reduce:transition-none motion-reduce:group-hover:translate-y-full"
                  style={{ transitionDelay: delay }}
                >
                  {char}
                </span>
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
