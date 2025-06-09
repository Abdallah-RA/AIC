// app/components/PixelCard.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import './PixelCard.css'

/** Configuration variants */
const VARIANTS = {
  default: { gap: 5, speed: 35, colors: "#f8fafc,#f1f5f9,#cbd5e1", noFocus: false },
  blue:    { gap: 10, speed: 25, colors: "#e0f2fe,#7dd3fc,#0ea5e9", noFocus: false },
  yellow:  { gap: 3,  speed: 20, colors: "#fef08a,#fde047,#eab308", noFocus: false },
  pink:    { gap: 6,  speed: 80, colors: "#fecdd3,#fda4af,#e11d48", noFocus: true  },
} as const
type VariantKey = keyof typeof VARIANTS

function getEffectiveSpeed(val: number, reducedMotion: boolean): number {
  const min = 0, max = 100, throttle = 0.001
  const parsed = Math.floor(val)
  if (parsed <= min || reducedMotion) return min
  if (parsed >= max) return max * throttle
  return parsed * throttle
}

class Pixel {
  width: number
  height: number
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  color: string
  speed: number
  size = 0
  sizeStep: number
  minSize = 0.5
  maxSizeInteger = 2
  maxSize: number
  delay: number
  counter = 0
  counterStep: number
  isIdle = false
  isReverse = false
  isShimmer = false

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width
    this.height = canvas.height
    this.ctx = ctx
    this.x = x
    this.y = y
    this.color = color
    this.speed = Math.random() * 0.8 * speed + 0.2 * speed
    this.sizeStep = Math.random() * 0.4
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize
    this.delay = delay
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
  }

  private draw() {
    const off = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(this.x + off, this.y + off, this.size, this.size)
  }

  appear() {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) this.isShimmer = true
    if (this.isShimmer) this.shimmer()
    else this.size += this.sizeStep
    this.draw()
  }

  disappear() {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.isIdle = true
      return
    }
    this.size -= 0.1
    this.draw()
  }

  private shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) this.isReverse = false
    this.size += this.isReverse ? -this.speed : this.speed
  }
}

interface PixelCardProps {
  variant?: VariantKey
  gap?: number
  speed?: number
  colors?: string
  noFocus?: boolean
  className?: string
  children: React.ReactNode
}

export default function PixelCard({
  variant = 'default',
  gap,
  speed,
  colors,
  noFocus,
  className = '',
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const pixelsRef    = useRef<Pixel[]>([])
  const animRef      = useRef<number>(0)
  const prevTime     = useRef<number>(performance.now())
  const triggerRef   = useRef<(fn: 'appear' | 'disappear') => void>(() => {})

  // Detect prefers-reduced-motion in the browser
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const cfg        = VARIANTS[variant] ?? VARIANTS.default
  const finalGap   = gap    ?? cfg.gap
  const finalSpeed = speed  ?? cfg.speed
  const finalCols  = colors ?? cfg.colors
  const finalNoF   = noFocus?? cfg.noFocus

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const cont   = containerRef.current
    const ctx    = canvas.getContext('2d')
    if (!ctx) return

    // Initialize pixels
    const initPixels = () => {
      const rect = cont.getBoundingClientRect()
      const w    = Math.floor(rect.width)
      const h    = Math.floor(rect.height)
      canvas.width  = w
      canvas.height = h
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`

      const cols = finalCols.split(',')
      const arr: Pixel[] = []
      for (let x = 0; x < w; x += finalGap) {
        for (let y = 0; y < h; y += finalGap) {
          const color = cols[Math.floor(Math.random() * cols.length)]
          const dx = x - w/2
          const dy = y - h/2
          const dist = Math.hypot(dx, dy)
          const delay = reducedMotion ? 0 : dist
          arr.push(new Pixel(
            canvas, ctx, x, y, color,
            getEffectiveSpeed(finalSpeed, reducedMotion),
            delay
          ))
        }
      }
      pixelsRef.current = arr
    }

    // Animation loop
    const step = (fn: 'appear' | 'disappear') => {
      animRef.current = requestAnimationFrame(() => step(fn))
      const now = performance.now()
      const dt  = now - prevTime.current
      if (dt < 1000 / 60) return
      prevTime.current = now - (dt % (1000 / 60))

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let allIdle = true
      for (const px of pixelsRef.current) {
        px[fn]()
        if (!px.isIdle) allIdle = false
      }
      if (allIdle) cancelAnimationFrame(animRef.current)
    }

    // Trigger function
    const trigger = (fn: 'appear' | 'disappear') => {
      cancelAnimationFrame(animRef.current)
      animRef.current = requestAnimationFrame(() => step(fn))
    }
    triggerRef.current = trigger

    // Run initial layout
    initPixels()
    const obs = new ResizeObserver(initPixels)
    obs.observe(cont)

    return () => {
      obs.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [finalGap, finalSpeed, finalCols, reducedMotion])

  // React event handlers call our trigger
  const handleEnter = () => triggerRef.current('appear')
  const handleLeave = () => triggerRef.current('disappear')

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`}
      tabIndex={ finalNoF ? -1 : 0 }
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={ finalNoF ? undefined : handleEnter }
      onBlur={ finalNoF ? undefined : handleLeave }
    >
      <canvas className="pixel-canvas" ref={canvasRef} />
      <div className="pixel-content">{children}</div>
    </div>
  )
}
