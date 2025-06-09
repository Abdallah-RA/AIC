// app/components/GooeyNav.tsx
'use client'

import React, { useRef, useEffect, useState } from 'react'
import './GooeyNav.css'

interface NavItem {
  label: string
  href: string
}

interface GooeyNavProps {
  items: NavItem[]
  animationTime?: number
  particleCount?: number
  particleDistances?: [number, number]
  particleR?: number
  timeVariance?: number
  colors?: number[]
  initialActiveIndex?: number
}

export default function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const navRef       = useRef<HTMLUListElement>(null)
  const filterRef    = useRef<HTMLSpanElement>(null)
  const textRef      = useRef<HTMLSpanElement>(null)
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)

  // small random helper
  const noise = (n = 1) => n / 2 - Math.random() * n

  const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180)
    return [distance * Math.cos(angle), distance * Math.sin(angle)] as [number, number]
  }

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10)
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end:   getXY(d[1] + noise(7), particleCount - i, particleCount),
      time:  t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0
        ? (rotate + r / 20) * 10
        : (rotate - r / 20) * 10,
    }
  }

  const makeParticles = (element: Element) => {
    if (!filterRef.current) return
    filterRef.current.style.setProperty(
      '--time',
      `${animationTime * 2 + timeVariance}ms`
    )
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        const p = createParticle(
          i,
          animationTime * 2 + noise(timeVariance * 2),
          particleDistances,
          particleR
        )
        const particle = document.createElement('span')
        const point    = document.createElement('span')
        particle.classList.add('particle')
        Object.entries({
          '--start-x': `${p.start[0]}px`,
          '--start-y': `${p.start[1]}px`,
          '--end-x':   `${p.end[0]}px`,
          '--end-y':   `${p.end[1]}px`,
          '--time':    `${p.time}ms`,
          '--scale':   `${p.scale}`,
          '--color':   `var(--color-${p.color}, white)`,
          '--rotate':  `${p.rotate}deg`,
        }).forEach(([prop, val]) =>
          particle.style.setProperty(prop, val)
        )
        point.classList.add('point')
        particle.appendChild(point)
        element.appendChild(particle)
        requestAnimationFrame(() => element.classList.add('active'))
        setTimeout(() => {
          try { element.removeChild(particle) } catch {}
        }, p.time)
      }, 30)
    }
  }

  const updateEffectPosition = (el: Element) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return

    const cRect = containerRef.current.getBoundingClientRect()
    const pos   = el.getBoundingClientRect()

    // Only copy the four properties we need:
    const newStyles = {
      left:   `${pos.x - cRect.x}px`,
      top:    `${pos.y - cRect.y}px`,
      width:  `${pos.width}px`,
      height: `${pos.height}px`,
    }

    Object.assign(filterRef.current.style, newStyles)
    Object.assign(textRef.current.style,  newStyles)

    textRef.current.innerText = el.textContent || ''
  }

  const handleClick = (
    e: React.MouseEvent<HTMLLIElement>,
    idx: number
  ) => {
    if (activeIndex === idx) return
    setActiveIndex(idx)
    const li = e.currentTarget
    updateEffectPosition(li)

    if (textRef.current) {
      textRef.current.classList.remove('active')
      // force reflow
      void textRef.current.offsetWidth
      textRef.current.classList.add('active')
    }

    if (filterRef.current) {
      filterRef.current.classList.remove('active')
      makeParticles(filterRef.current)
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    idx: number
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const li = (e.currentTarget as HTMLElement).parentElement!
      handleClick({ currentTarget: li } as any, idx)
    }
  }

  useEffect(() => {
    if (!navRef.current) return
    const lis      = Array.from(navRef.current.querySelectorAll('li'))
    const activeLi = lis[activeIndex]
    if (activeLi) {
      updateEffectPosition(activeLi)
      textRef.current?.classList.add('active')
    }
    const ro = new ResizeObserver(() => {
      const cur = navRef.current?.querySelectorAll('li')[activeIndex]
      if (cur) updateEffectPosition(cur)
    })
    ro.observe(containerRef.current!)
    return () => ro.disconnect()
  }, [activeIndex])

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((it, i) => (
            <li
              key={i}
              className={activeIndex === i ? 'active' : ''}
              onClick={e => handleClick(e, i)}
            >
              <a href={it.href} onKeyDown={e => handleKeyDown(e, i)}>
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text"   ref={textRef} />
    </div>
  )
}
