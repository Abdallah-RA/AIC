'use client'

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { motion, AnimatePresence, MotionProps, Transition, AnimatePresenceProps } from 'framer-motion'

// simple helper to join classes
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export interface RotatingTextProps
  extends Omit<MotionProps, 'initial' | 'animate' | 'exit' | 'transition'> {
  texts: string[]
  transition?: Transition
  initial?: MotionProps['initial']
  animate?: MotionProps['animate']
  exit?: MotionProps['exit']
  animatePresenceMode?: AnimatePresenceProps['mode']
  animatePresenceInitial?: boolean
  rotationInterval?: number
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number
  loop?: boolean
  auto?: boolean
  splitBy?: 'characters' | 'words' | 'lines' | string
  onNext?: (index: number) => void
  mainClassName?: string
  splitLevelClassName?: string
  elementLevelClassName?: string
}

const RotatingText = forwardRef<HTMLSpanElement, RotatingTextProps>((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: '-120%', opacity: 0 },
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props

  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const splitIntoCharacters = (text: string): string[] => {
    // if Intl.Segmenter is available, use it for proper grapheme breaks
    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
      // segment(text) returns Iterable<{ segment: string; index?: number; breakType?: string }>
      return Array.from(segmenter.segment(text), segment => segment.segment)
    }
    // fallback to simple split
    return Array.from(text)
  }

  const elements = useMemo(() => {
    const t = texts[currentTextIndex]
    if (splitBy === 'characters') {
      const words = t.split(' ')
      return words.map((w, i) => ({
        characters: splitIntoCharacters(w),
        needsSpace: i !== words.length - 1,
      }))
    }
    if (splitBy === 'words') {
      return t.split(' ').map((w, i, arr) => ({
        characters: [w],
        needsSpace: i !== arr.length - 1,
      }))
    }
    if (splitBy === 'lines') {
      return t.split('\n').map((l, i, arr) => ({
        characters: [l],
        needsSpace: i !== arr.length - 1,
      }))
    }
    return t.split(splitBy).map((part, i, arr) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1,
    }))
  }, [texts, currentTextIndex, splitBy])

  const getStaggerDelay = useCallback(
    (idx: number, total: number) => {
      if (staggerFrom === 'first') return idx * staggerDuration
      if (staggerFrom === 'last') return (total - 1 - idx) * staggerDuration
      if (staggerFrom === 'center') {
        const center = Math.floor(total / 2)
        return Math.abs(center - idx) * staggerDuration
      }
      if (staggerFrom === 'random') {
        const rand = Math.floor(Math.random() * total)
        return Math.abs(rand - idx) * staggerDuration
      }
      if (typeof staggerFrom === 'number') {
        return Math.abs(staggerFrom - idx) * staggerDuration
      }
      return 0
    },
    [staggerFrom, staggerDuration]
  )

  const handleIndexChange = useCallback(
    (newIdx: number) => {
      setCurrentTextIndex(newIdx)
      onNext?.(newIdx)
    },
    [onNext]
  )

  const next = useCallback(() => {
    const atEnd = currentTextIndex === texts.length - 1
    const nextIdx = atEnd ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1
    if (nextIdx !== currentTextIndex) {
      handleIndexChange(nextIdx)
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange])

  useEffect(() => {
    if (!auto) return
    const id = setInterval(next, rotationInterval)
    return () => clearInterval(id)
  }, [next, rotationInterval, auto])

  useImperativeHandle(ref, () => ({ next }), [next])

  return (
    <motion.span
      ref={ref}
      className={cn('text-rotate', mainClassName)}
      {...rest}
      layout
      transition={transition}
    >
      {/* Screen‐reader only text */}
      <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>

      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.div
          key={currentTextIndex}
          className={cn(
            splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate',
            splitLevelClassName
          )}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj, wIdx, arr) => {
            const prevChars = arr
              .slice(0, wIdx)
              .reduce((sum, w) => sum + w.characters.length, 0)

            return (
              <span key={wIdx} className="text-rotate-word">
                {wordObj.characters.map((ch, cIdx) => (
                  <motion.span
                    key={cIdx}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        prevChars + cIdx,
                        arr.reduce((a, w) => a + w.characters.length, 0)
                      ),
                    }}
                    className={cn('text-rotate-element', elementLevelClassName)}
                  >
                    {ch}
                  </motion.span>
                ))}
                {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
              </span>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </motion.span>
  )
})

RotatingText.displayName = 'RotatingText'
export default RotatingText
