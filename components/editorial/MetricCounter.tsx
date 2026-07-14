'use client'

import { useEffect, useRef, useState } from 'react'

interface MetricCounterProps {
  target: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

/** Animates a number counting up from 0 to `target` once it scrolls into view. */
export default function MetricCounter({
  target,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1800,
  className = '',
}: MetricCounterProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setValue(eased * target)
            if (progress < 1) requestAnimationFrame(tick)
            else setValue(target)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [duration, target])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value)}
      {suffix}
    </span>
  )
}
