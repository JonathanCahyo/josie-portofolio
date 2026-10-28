import { useLayoutEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger, SplitText } from './gsap'
import { prefersReducedMotion } from '../hooks/useMedia'

type SplitOpts = {
  /** words for headings, lines for paragraphs */
  by?: 'words' | 'lines'
  stagger?: number
  delay?: number
  start?: string
  /** Animate immediately instead of on scroll (used in the hero after the loader). */
  immediate?: boolean
  /** Gate for immediate reveals (e.g. wait until the loader has left). */
  enabled?: boolean
}

/**
 * Masked per-word / per-line reveal. SplitText re-splits on resize and font
 * load (autoSplit), so lines stay correct and nothing shifts layout: the text
 * keeps its box, only the inner spans translate within their masks.
 */
export function useSplitReveal(ref: RefObject<HTMLElement | null>, opts: SplitOpts = {}) {
  const { by = 'words', stagger, delay = 0, start = 'top 85%', immediate = false, enabled = true } = opts

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !enabled || prefersReducedMotion()) return

    const split = SplitText.create(el, {
      type: by === 'lines' ? 'lines' : 'words,lines',
      mask: by,
      autoSplit: true,
      linesClass: 'split-line',
      onSplit(self) {
        const targets = by === 'lines' ? self.lines : self.words
        return gsap.from(targets, {
          yPercent: 115,
          duration: by === 'lines' ? 1.1 : 1.0,
          stagger: stagger ?? (by === 'lines' ? 0.09 : 0.045),
          delay,
          ease: 'reveal',
          scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
        })
      },
    })
    return () => split.revert()
  }, [ref, by, stagger, delay, start, immediate, enabled])
}

/** Fade + rise for blocks (images, cards). Children with [data-reveal] are staggered. */
export function useBlockReveal(ref: RefObject<HTMLElement | null>, opts: { y?: number; stagger?: number; start?: string } = {}) {
  const { y = 48, stagger = 0.08, start = 'top 82%' } = opts

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const items = el.querySelectorAll<HTMLElement>('[data-reveal]')
      const targets = items.length ? items : [el]
      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: 1.1,
        stagger,
        ease: 'reveal',
        scrollTrigger: { trigger: el, start, once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [ref, y, stagger, start])
}

/** Subtle scroll-linked parallax on an element (translateY by `amount` % of its height). */
export function useParallax(ref: RefObject<HTMLElement | null>, amount = 12) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const tween = gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [ref, amount])
}

export { ScrollTrigger }
