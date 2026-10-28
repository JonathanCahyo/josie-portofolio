import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BEZIER } from '../animations/easing'
import { Logo } from './Logo'

const MIN_MS = 1500

/**
 * Film-leader countdown (3 · 2 · 1) shown while fonts and the 3D scene load.
 * Leaves with an iris-close, like the end of a reel. Under reduced motion it
 * simply fades.
 */
export function Loader({ ready, reduced, onExited }: { ready: boolean; reduced: boolean; onExited: () => void }) {
  const [minElapsed, setMinElapsed] = useState(false)
  const [count, setCount] = useState(3)
  const show = !(ready && minElapsed)

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), reduced ? 300 : MIN_MS)
    return () => clearTimeout(t)
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const i = setInterval(() => setCount((c) => (c > 1 ? c - 1 : ready ? 1 : 3)), MIN_MS / 3)
    return () => clearInterval(i)
  }, [ready, reduced])

  return (
    <AnimatePresence onExitComplete={onExited}>
      {show && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label="Loading Josie's Portofolio"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-bg-deep"
          initial={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 50%)' }}
          transition={{ duration: reduced ? 0.3 : 1.0, ease: BEZIER.cine }}
        >
          <div className="relative flex aspect-square w-[min(62vmin,420px)] items-center justify-center">
            {/* leader crosshair + rings */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-cream/25" aria-hidden>
              <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.75" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.75" />
            </svg>
            {/* sweeping hand */}
            {!reduced && (
              <div
                className="absolute inset-[4%] rounded-full opacity-35"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(240,230,220,0.55), rgba(240,230,220,0) 30%)',
                  animation: `leader-sweep ${MIN_MS / 3}ms linear infinite`,
                }}
              />
            )}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ opacity: 0, scale: 1.25 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.35, ease: BEZIER.reveal }}
                className="relative font-display text-[clamp(5rem,22vmin,9rem)] leading-none font-black text-cream"
                aria-hidden
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-80">
            <Logo />
          </div>
          <style>{`@keyframes leader-sweep { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
