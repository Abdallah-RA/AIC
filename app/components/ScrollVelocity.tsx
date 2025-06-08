'use client'

import React, {
  forwardRef,
  useRef,
  useEffect,
  useMemo,
  CSSProperties,
  RefObject,
} from 'react'
import {
  motion,
  useMotionValue,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useAnimationFrame,      // <-- use Framer’s hook
} from 'framer-motion'
import './ScrollVelocity.css'

export interface ScrollVelocityProps {
  /** Optional container whose scroll or pointer we track */
  scrollContainerRef?: RefObject<HTMLElement>
  /** Lines of text to loop */
  texts: string[]
  /** Base horizontal speed in px per second */
  velocity?: number
  /** Damping for smoothing scroll velocity */
  damping?: number
  /** Stiffness for smoothing scroll velocity */
  stiffness?: number
  /** How many copies of each text to render */
  numCopies?: number
  /** Map raw scroll velocity to multiplier */
  velocityMapping?: { input: [number, number]; output: [number, number] }
  /** CSS class for outer “mask” container */
  parallaxClassName?: string
  /** CSS class for the inner scrolling element */
  scrollerClassName?: string
  /** Inline styles for outer container */
  parallaxStyle?: CSSProperties
  /** Inline styles for scroller */
  scrollerStyle?: CSSProperties
  /** Extra class to apply to each text span */
  className?: string
}

function useMousePositionRef(
  containerRef?: RefObject<HTMLElement>
): React.MutableRefObject<{ x: number; y: number }> {
  const pos = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const update = (x: number, y: number) => {
      if (containerRef?.current) {
        const r = containerRef.current.getBoundingClientRect()
        pos.current = { x: x - r.left, y: y - r.top }
      } else {
        pos.current = { x, y }
      }
    }
    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      update(t.clientX, t.clientY)
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [containerRef])
  return pos
}

const ScrollVelocity = forwardRef<HTMLDivElement, ScrollVelocityProps>(
  (
    {
      scrollContainerRef,
      texts,
      velocity = 100,
      damping = 50,
      stiffness = 400,
      numCopies = 6,
      velocityMapping = { input: [0, 1000], output: [0, 5] },
      parallaxClassName = 'parallax',
      scrollerClassName = 'scroller',
      parallaxStyle = {},
      scrollerStyle = {},
      className = '',
    },
    ref
  ) => {
    // drive the scrolling offset
    const motionX = useMotionValue(0)

    // get raw scroll Y velocity, smooth it, map to multiplier
    const { scrollY } = useScroll(
      scrollContainerRef ? { container: scrollContainerRef } : {}
    )
    const rawVel = useVelocity(scrollY)
    const smoothVel = useSpring(rawVel, { damping, stiffness })
    const factor = useTransform(
      smoothVel,
      velocityMapping.input,
      velocityMapping.output
    )

    // animate each frame
    const dir = useRef(1)
    useAnimationFrame((t, delta) => {
      // flip on scroll reversal
      const f = factor.get()
      if (f < 0) dir.current = -1
      else if (f > 0) dir.current = 1

      // base move + extra
      const move = (dir.current * velocity * delta) / 1000
      motionX.set(motionX.get() + move + move * f)
    })

    // track pointer (unused here, but you could cascade into letter effects)
    const mousePos = useMousePositionRef(scrollContainerRef)

    return (
      <div
        ref={ref}
        className={parallaxClassName}
        style={parallaxStyle}
      >
        <motion.div
          className={scrollerClassName}
          style={{ x: motionX, ...scrollerStyle }}
        >
          {texts.map((txt, i) => (
            <span key={i} className={className}>
              {Array.from({ length: numCopies }).map((_, idx) => (
                <span key={idx} style={{ whiteSpace: 'nowrap' }}>
                  {txt}&nbsp;
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>
    )
  }
)

ScrollVelocity.displayName = 'ScrollVelocity'
export default ScrollVelocity
