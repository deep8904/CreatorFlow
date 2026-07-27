'use client'

import { useEffect, useRef } from 'react'

interface DotGridProps {
  className?: string
  color?: string
}

/**
 * Lightweight 2D-canvas dot field with a mouse-reactive glow — a supporting
 * ambient layer behind hero content, not a literal WebGL/GLSL port (kept
 * performant and dependency-free; falls back to a static grid when the
 * viewer prefers reduced motion).
 */
export default function DotGrid({ className = '', color = '0, 0, 0' }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const spacing = 34

    let width = 0
    let height = 0
    let mouseX = -9999
    let mouseY = -9999
    let targetMouseX = -9999
    let targetMouseY = -9999
    let raf = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouseX = e.clientX - rect.left
      targetMouseY = e.clientY - rect.top
    }
    window.addEventListener('pointermove', onMove)

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      mouseX += (targetMouseX - mouseX) * 0.08
      mouseY += (targetMouseY - mouseY) * 0.08

      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1
      const t = prefersReducedMotion ? 0 : time * 0.0006

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing
          const y = j * spacing
          const distToMouse = Math.hypot(x - mouseX, y - mouseY)
          const ripple = Math.max(0, 1 - distToMouse / 220)
          const wave = prefersReducedMotion ? 0 : Math.sin(i * 0.35 + t) * Math.cos(j * 0.35 + t)
          const baseAlpha = 0.06 + wave * 0.035
          const alpha = Math.min(0.9, Math.max(0.02, baseAlpha + ripple * 0.7))
          const radius = 1 + ripple * 2.2

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${color}, ${alpha})`
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  )
}
