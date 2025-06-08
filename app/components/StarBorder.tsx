// app/components/StarBorder.tsx
'use client'

import React, {
  ElementType,
  ReactNode,
  CSSProperties,
  HTMLAttributes,
} from 'react'
import './StarBorder.css'

interface StarBorderProps extends HTMLAttributes<HTMLElement> {
  /** Which element or component to render as (defaults to "button") */
  as?: ElementType
  /** Extra classes to apply */
  className?: string
  /** Color of the animated border highlights */
  color?: string
  /** Animation duration (e.g. "6s", "500ms") */
  speed?: string
  /** Content inside the bordered container */
  children: ReactNode
}

export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = 'white',
  speed = '6s',
  children,
  ...rest
}: StarBorderProps) {
  // we cast the style objects to CSSProperties so TS is happy
  const gradientStyle: CSSProperties = {
    background: `radial-gradient(circle, ${color}, transparent 10%)`,
    animationDuration: speed,
  }

  return (
    <Component className={`star-border-container ${className}`} {...rest}>
      <div className="border-gradient-bottom" style={gradientStyle} />
      <div className="border-gradient-top" style={gradientStyle} />
      <div className="inner-content">{children}</div>
    </Component>
  )
}
