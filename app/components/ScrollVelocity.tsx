'use client'

import React, {
  forwardRef,
  useRef,
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
  useAnimationFrame,
} from 'framer-motion'
import './ScrollVelocity.css'

export interface ScrollVelocityProps {
  scrollContainerRef?: RefObject<HTMLElement>
  texts: string[]
  velocity?: number
  damping?: number
  stiffness?: number
  numCopies?: number
  velocityMapping?: { input: [number, number]; output: [number, number] }
  parallaxClassName?: string
  scrollerClassName?: string
  parallaxStyle?: CSSProperties
  scrollerStyle?: CSSProperties
  className?: string
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
    const motionX = useMotionValue(0)
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

    const dir = useRef(1)
    useAnimationFrame((_, delta) => {
      const f = factor.get()
      dir.current = f < 0 ? -1 : 1
      const move = (dir.current * velocity * delta) / 1000
      motionX.set(motionX.get() + move + move * f)
    })

    return (
      <div ref={ref} className={parallaxClassName} style={parallaxStyle}>
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
