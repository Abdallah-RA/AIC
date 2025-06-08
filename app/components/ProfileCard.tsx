// app/components/ProfileCard.tsx
'use client'

import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import './ProfileCard.css'

const DEFAULT_BEHIND_GRADIENT =
  'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)'
const DEFAULT_INNER_GRADIENT =
  'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)'
const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
} as const

// Helpers
const clamp = (v: number, min = 0, max = 100): number =>
  Math.min(Math.max(v, min), max)
const round = (v: number, p = 3): number =>
  parseFloat(v.toFixed(p))
const adjust = (
  v: number,
  fmin: number,
  fmax: number,
  tmin: number,
  tmax: number
): number => round(tmin + ((tmax - tmin) * (v - fmin)) / (fmax - fmin))
const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2

// Allow custom properties in style object:
type CSSVariables = React.CSSProperties & {
  [key: `--${string}`]: string
}

export interface ProfileCardProps {
  avatarUrl: string
  iconUrl?: string
  grainUrl?: string
  behindGradient?: string
  innerGradient?: string
  showBehindGradient?: boolean
  className?: string
  enableTilt?: boolean
  miniAvatarUrl?: string
  name?: string
  title?: string
  handle?: string
  status?: string
  contactText?: string
  showUserInfo?: boolean
  onContactClick?: () => void
}

const ProfileCardComponent: FC<ProfileCardProps> = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = '',
  enableTilt = true,
  miniAvatarUrl,
  name = 'User Name',
  title = 'Title',
  handle = 'handle',
  status = 'Online',
  contactText = 'Contact',
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)

  type Handlers = {
    updateCardTransform: (
      offsetX: number,
      offsetY: number,
      card: HTMLElement,
      wrap: HTMLDivElement
    ) => void
    createSmoothAnimation: (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement,
      wrap: HTMLDivElement
    ) => void
    cancelAnimation: () => void
  }

  const animationHandlers = useMemo<Handlers | null>(() => {
    if (!enableTilt) return null
    let rafId: number | null = null

    const updateCardTransform: Handlers['updateCardTransform'] = (
      offsetX, offsetY, card, wrap
    ) => {
      const w = card.clientWidth
      const h = card.clientHeight
      const px = clamp((100 / w) * offsetX)
      const py = clamp((100 / h) * offsetY)
      const cx = px - 50
      const cy = py - 50
      const props: Record<string, string> = {
        '--pointer-x': `${px}%`,
        '--pointer-y': `${py}%`,
        '--background-x': `${adjust(px, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(py, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(px-50, py-50)/50,0,1)}`,
        '--pointer-from-top': `${py/100}`,
        '--pointer-from-left': `${px/100}`,
        '--rotate-x': `${round(-cy/4)}deg`,
        '--rotate-y': `${round(cx/5)}deg`,
      }
      Object.entries(props).forEach(([k,v]) =>
        wrap.style.setProperty(k, v)
      )
    }

    const createSmoothAnimation: Handlers['createSmoothAnimation'] = (
      dur, startX, startY, card, wrap
    ) => {
      const t0 = performance.now()
      const tx = wrap.clientWidth/2
      const ty = wrap.clientHeight/2
      const loop = (t: number) => {
        const elapsed = t - t0
        const prog = clamp(elapsed/dur)
        const eased = easeInOutCubic(prog)
        const cx = adjust(eased, 0, 1, startX, tx)
        const cy = adjust(eased, 0, 1, startY, ty)
        updateCardTransform(cx, cy, card, wrap)
        if (prog < 1) rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
    }

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId != null) cancelAnimationFrame(rafId)
        rafId = null
      },
    }
  }, [enableTilt])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const card = cardRef.current
      const wrap = wrapRef.current
      if (!card || !wrap || !animationHandlers) return
      const rect = card.getBoundingClientRect()
      animationHandlers.updateCardTransform(
        e.clientX - rect.left,
        e.clientY - rect.top,
        card,
        wrap
      )
    },
    [animationHandlers]
  )

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current
    const wrap = wrapRef.current
    if (!card || !wrap || !animationHandlers) return
    animationHandlers.cancelAnimation()
    wrap.classList.add('active')
    card.classList.add('active')
  }, [animationHandlers])

  const handlePointerLeave = useCallback(
    (e: PointerEvent) => {
      const card = cardRef.current
      const wrap = wrapRef.current
      if (!card || !wrap || !animationHandlers) return
      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        e.offsetX,
        e.offsetY,
        card,
        wrap
      )
      wrap.classList.remove('active')
      card.classList.remove('active')
    },
    [animationHandlers]
  )

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return
    const card = cardRef.current!
    const wrap = wrapRef.current!

    card.addEventListener('pointerenter', handlePointerEnter)
    card.addEventListener('pointermove', handlePointerMove as any)
    card.addEventListener('pointerleave', handlePointerLeave)

    const initX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET
    const initY = ANIMATION_CONFIG.INITIAL_Y_OFFSET
    animationHandlers.updateCardTransform(initX, initY, card, wrap)
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.INITIAL_DURATION,
      initX,
      initY,
      card,
      wrap
    )

    return () => {
      card.removeEventListener('pointerenter', handlePointerEnter)
      card.removeEventListener('pointermove', handlePointerMove as any)
      card.removeEventListener('pointerleave', handlePointerLeave)
      animationHandlers.cancelAnimation()
    }
  }, [
    enableTilt,
    animationHandlers,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
  ])

  const cardStyle = useMemo<CSSVariables>(
    () => ({
      '--icon': iconUrl ? `url(${iconUrl})` : 'none',
      '--grain': grainUrl ? `url(${grainUrl})` : 'none',
      '--behind-gradient': showBehindGradient
        ? behindGradient ?? DEFAULT_BEHIND_GRADIENT
        : 'none',
      '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
    }),
    [
      iconUrl,
      grainUrl,
      showBehindGradient,
      behindGradient,
      innerGradient,
    ]
  )

  const handleContactClick = useCallback(() => {
    onContactClick?.()
  }, [onContactClick])

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`}
      style={cardStyle}
    >
      <section ref={cardRef} className="pc-card">
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />

          <div className="pc-content pc-avatar-content">
            <img
              className="avatar"
              src={avatarUrl}
              alt={`${name} avatar`}
              loading="lazy"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={miniAvatarUrl ?? avatarUrl}
                      alt={`${name} mini avatar`}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = avatarUrl
                        img.style.opacity = '0.5'
                      }}
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                    <div className="pc-status">{status}</div>
                  </div>
                </div>
                <button
                  className="pc-contact-btn"
                  onClick={handleContactClick}
                  type="button"
                  aria-label={`Contact ${name}`}
                >
                  {contactText}
                </button>
              </div>
            )}
          </div>

          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default React.memo(ProfileCardComponent)
