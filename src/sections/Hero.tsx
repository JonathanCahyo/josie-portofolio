import { useLayoutEffect, useRef, type PointerEvent } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { contact, site } from '../data/site'
import { gsap } from '../animations/gsap'
import { useSplitReveal } from '../animations/useReveal'
import { useSmoothScroll } from '../animations/SmoothScroll'
import { useFinePointer, useReducedMotion } from '../hooks/useMedia'
import { MagneticButton } from '../components/Magnetic'

/** Letters 3–6 are outlined, as in the deck where "TOFO" crosses the subject. */
const OUTLINED = new Set([3, 4, 5, 6])

function Word({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex whitespace-nowrap">
      {[...site.brand.word].map((ch, i) => {
        const outlined = OUTLINED.has(i) !== inverse
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.04em] align-bottom">
            <span className={`hero-letter inline-block ${outlined ? 'text-outline' : 'text-fg'}`}>{ch}</span>
          </span>
        )
      })}
    </span>
  )
}

export function Hero({ introDone }: { introDone: boolean }) {
  const root = useRef<HTMLElement>(null)
  const mark = useRef<HTMLDivElement>(null)
  const sub = useRef<HTMLParagraphElement>(null)
  const { scrollTo } = useSmoothScroll()
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  // Lens: inside a circle that follows the pointer, solid and outline letters swap.
  const lx = useMotionValue(0)
  const ly = useMotionValue(0)
  const lr = useSpring(0, { stiffness: 220, damping: 26 })
  const sx = useSpring(lx, { stiffness: 400, damping: 40 })
  const sy = useSpring(ly, { stiffness: 400, damping: 40 })
  const clip = useMotionTemplate`circle(${lr}px at ${sx}px ${sy}px)`
  const lensOn = fine && !reduced

  const onMove = (e: PointerEvent) => {
    if (!lensOn || !mark.current) return
    const r = mark.current.getBoundingClientRect()
    lx.set(e.clientX - r.left)
    ly.set(e.clientY - r.top)
    const inside = e.clientY > r.top - 60 && e.clientY < r.bottom + 60
    lr.set(inside ? Math.min(150, r.height * 0.75) : 0)
  }

  useSplitReveal(sub, { by: 'lines', immediate: true, enabled: introDone, delay: 0.55 })

  useLayoutEffect(() => {
    if (!introDone || reduced || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-letter', { yPercent: 110, duration: 1.3, stagger: 0.05, ease: 'reveal' })
      gsap.from('.hero-script', { autoAlpha: 0, x: -30, duration: 1.4, delay: 0.35, ease: 'reveal' })
      gsap.from('.hero-fade', { autoAlpha: 0, y: 24, duration: 1, delay: 0.8, stagger: 0.1, ease: 'reveal' })
    }, root)
    return () => ctx.revert()
  }, [introDone, reduced])

  return (
    <section
      ref={root}
      id="profile"
      data-nav="profile"
      data-scene="hero"
      onPointerMove={onMove}
      onPointerLeave={() => lr.set(0)}
      className="relative flex min-h-[100svh] flex-col justify-end pt-32 pb-[9vh]"
      style={{ visibility: introDone || reduced ? 'visible' : 'hidden' }}
    >
      <div className="container-page relative">
        <h1 className="sr-only">
          Josie’s Portofolio — {site.name}, {site.role}
        </h1>

        <div ref={mark} aria-hidden className="relative w-fit select-none">
          <span className="hero-script absolute -top-[0.55em] left-[0.4em] z-10 font-script text-[min(5.25rem,9vw)] leading-none text-fg drop-shadow-[0_6px_20px_rgb(0_0_0/0.4)]">
            {site.brand.script}
          </span>
          <div className="font-display text-[min(10.25rem,11.4vw)] leading-[0.86] font-black tracking-[0.005em]">
            <Word />
          </div>
          {lensOn && (
            <motion.div
              className="pointer-events-none absolute inset-0 font-display text-[min(10.25rem,11.4vw)] leading-[0.86] font-black tracking-[0.005em]"
              style={{ clipPath: clip }}
            >
              <div className="absolute inset-0 bg-bg/30 backdrop-blur-[2px]" />
              <div className="relative">
                <Word inverse />
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-12">
          <p ref={sub} className="max-w-xl text-body-lg text-muted md:col-span-6">
            {site.role} and {site.study} student at {site.university} — designing visual content, producing stories and
            documenting events.
          </p>
          <div className="hero-fade flex flex-wrap gap-3 md:col-span-6 md:justify-end">
            <MagneticButton
              variant="cream"
              href="#gallery"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#gallery')
              }}
            >
              Explore the gallery <span aria-hidden>→</span>
            </MagneticButton>
            <MagneticButton variant="ghost" href={`mailto:${contact.email}`}>
              Get in touch
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
