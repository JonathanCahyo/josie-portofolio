import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { easeCine } from './easing'
import { scrollState } from './scrollState'
import { prefersReducedMotion } from '../hooks/useMedia'

type ScrollTo = (target: string | HTMLElement | number, opts?: { offset?: number }) => void

const Ctx = createContext<{ scrollTo: ScrollTo; lenis: () => Lenis | null }>({
  scrollTo: () => {},
  lenis: () => null,
})

export const useSmoothScroll = () => useContext(Ctx)

/**
 * Lenis drives the scroll; GSAP's ticker drives Lenis so ScrollTrigger and the
 * smooth scroll share one clock (no double rAF, no jitter on pinned sections).
 * With prefers-reduced-motion Lenis is skipped and native scrolling is used.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const onNativeScroll = () => {
      scrollState.velocity = 0
      scrollState.progress = progressOf(window.scrollY)
    }

    if (reduced) {
      window.addEventListener('scroll', onNativeScroll, { passive: true })
      return () => window.removeEventListener('scroll', onNativeScroll)
    }

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    lenisRef.current = lenis

    lenis.on('scroll', (l: Lenis) => {
      scrollState.velocity = l.velocity
      scrollState.progress = l.progress
      ScrollTrigger.update()
    })
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = useCallback<ScrollTo>((target, opts) => {
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(target, { offset: opts?.offset ?? 0, duration: 1.4, easing: easeCine })
      return
    }
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    const y = typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY : 0
    window.scrollTo({ top: y + (opts?.offset ?? 0) })
  }, [])

  const getLenis = useCallback(() => lenisRef.current, [])

  return <Ctx.Provider value={{ scrollTo, lenis: getLenis }}>{children}</Ctx.Provider>
}

function progressOf(y: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? y / max : 0
}
