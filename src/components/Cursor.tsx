import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useFinePointer, useReducedMotion } from '../hooks/useMedia'

/**
 * Lens cursor: a cream dot plus a ring that trails behind, grows over
 * interactive elements and shows a label for elements with [data-cursor].
 * Only on fine pointers without reduced motion; otherwise the OS cursor stays.
 */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 })
  const [hover, setHover] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [data-cursor]')
      setHover(!!target)
      setLabel(target?.dataset.cursor ?? null)
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const ring = label ? 84 : hover ? 54 : 34
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div className="absolute top-0 left-0" style={{ x: rx, y: ry }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/70"
          animate={{ width: ring, height: ring, backgroundColor: label ? 'rgba(240,230,220,0.95)' : 'rgba(240,230,220,0)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <AnimatePresence>
            {label && (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="flex h-full w-full items-center justify-center font-serif text-[0.7rem] font-bold tracking-[0.2em] text-accent uppercase"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div className="absolute top-0 left-0" style={{ x, y }}>
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" />
      </motion.div>
    </div>
  )
}
