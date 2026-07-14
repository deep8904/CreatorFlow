'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface RevealUpProps {
  children: ReactNode
  delay?: 0 | 1 | 2 | 3
  className?: string
  as?: 'div' | 'section'
}

const delayClass = { 0: '', 1: 'reveal-delay-1', 2: 'reveal-delay-2', 3: 'reveal-delay-3' } as const

/** Fades + slides a block up into place the first time it enters the viewport. */
export default function RevealUp({ children, delay = 0, className = '', as = 'div' }: RevealUpProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = as
  return (
    <Tag ref={ref} className={`reveal-up ${delayClass[delay]} ${className}`}>
      {children}
    </Tag>
  )
}
