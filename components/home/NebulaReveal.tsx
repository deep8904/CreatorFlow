'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'

/**
 * Scroll-triggered entrance wrapper for the Nebula system.
 *
 * The reference build attaches one shared IntersectionObserver at document
 * level and toggles a class; this is the React equivalent — each instance
 * observes itself, unobserves after firing once, and adds `.is-inview` to
 * un-pause the CSS animation declared by `.nebula-reveal`.
 *
 * The animation is authored paused-by-default in CSS rather than
 * opacity-0-by-default in markup, so content is still present and readable
 * if JS never runs.
 */
export function NebulaReveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  /** Entrance delay in ms — used to stagger a group. */
  delay?: number
  as?: ElementType
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-inview')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`nebula-reveal ${className}`}
      style={{ animationDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
