/**
 * Shared interaction strings for the dashboard tier. Values match the
 * console CSS custom properties in globals.css (--console-accent, the
 * cubic-bezier easing DESIGN.md mandates) so this tier reads as the same
 * system as Home and Auth, not a fourth invented variant.
 */
export const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400'

export const FOCUS_INSET =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-400'

export const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

export const HOVER = `transition-all duration-150 ${EASE}`
