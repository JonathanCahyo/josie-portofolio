import { useRef, type MouseEvent, type ReactNode, type PointerEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { SPRING } from '../animations/easing'
import { useFinePointer, useReducedMotion } from '../hooks/useMedia'

/** Pulls its child toward the pointer while hovered; springs back on leave. */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const x = useSpring(useMotionValue(0), SPRING)
  const y = useSpring(useMotionValue(0), SPRING)
  const active = fine && !reduced

  const onMove = (e: PointerEvent) => {
    if (!active || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.span>
  )
}

type ButtonProps = {
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  children: ReactNode
  variant?: 'cream' | 'pill' | 'ghost'
  external?: boolean
  cursor?: string
  className?: string
}

const variants = {
  cream: 'bg-cream text-accent hover:bg-white',
  pill: 'pill text-fg hover:brightness-125',
  ghost: 'border border-line text-fg hover:border-fg/40 hover:bg-white/5',
}

/** Magnetic call-to-action. Renders <a> when href is set, otherwise <button>. */
export function MagneticButton({ href, onClick, children, variant = 'pill', external, cursor, className = '' }: ButtonProps) {
  const cls = `group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-body font-bold transition-[background-color,filter,border-color] duration-200 ${variants[variant]} ${className}`
  return (
    <Magnetic>
      {href ? (
        <a
          href={href}
          onClick={onClick}
          className={cls}
          data-cursor={cursor}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={cls} data-cursor={cursor}>
          {children}
        </button>
      )}
    </Magnetic>
  )
}
