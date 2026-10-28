import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { organizations, organizationsIntro } from '../data/organizations'
import { gsap } from '../animations/gsap'
import { useSplitReveal } from '../animations/useReveal'
import { useSmoothScroll } from '../animations/SmoothScroll'
import { BEZIER } from '../animations/easing'
import { useReducedMotion } from '../hooks/useMedia'
import { Eyebrow } from '../components/Bits'
import { Media } from '../components/Media'
import type { Organization } from '../data/types'

const STEP_DEG = 15

function OrgCard({ org }: { org: Organization }) {
  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-card p-3 pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 px-2 pt-1 pb-2 md:px-3 md:pt-2 md:pb-3">
        <div>
          <p className="font-serif text-[0.95rem] leading-tight font-bold text-fg md:text-[1.15rem]">{org.name}</p>
          {org.generation && <p className="font-serif text-caption text-fg/90">{org.generation}</p>}
        </div>
        <p className="text-caption text-muted">{org.period}</p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[1.6rem]">
        <Media image={org.cover} className="h-full w-full object-cover object-top" />
      </div>
    </div>
  )
}

export function Organizations() {
  const root = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const cards = useRef<Array<HTMLElement | null>>([])
  const [active, setActive] = useState(2)
  const reduced = useReducedMotion()
  const { scrollTo } = useSmoothScroll()
  const n = organizations.length
  const current = organizations[active]

  useSplitReveal(heading, { by: 'words' })

  useLayoutEffect(() => {
    const el = root.current
    if (!el || reduced) return
    const place = (f: number) => {
      cards.current.forEach((c, i) => {
        if (!c) return
        const d = i - f
        const ad = Math.abs(d)
        gsap.set(c, {
          rotate: d * STEP_DEG,
          scale: 1 - Math.min(ad, 3) * 0.06,
          autoAlpha: Math.max(0, 1 - ad * 0.22),
          zIndex: 10 - Math.round(ad),
        })
      })
      setActive((prev) => {
        const next = Math.round(f)
        return next === prev ? prev : next
      })
    }
    const state = { f: 0 }
    place(state.f)
    const tween = gsap.to(state, {
      f: n - 1,
      ease: 'none',
      onUpdate: () => place(state.f),
      scrollTrigger: { trigger: el, start: 'top top', end: `+=${(n - 1) * 55}%`, pin: true, scrub: 0.8 },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [n, reduced])

  return (
    <section
      ref={root}
      id="gallery"
      data-nav="gallery"
      data-scene="gallery"
      aria-labelledby="orgs-title"
      className={`relative ${reduced ? 'py-28' : 'h-[100svh] overflow-hidden'}`}
    >
      <div className="container-page relative z-20 pt-28 md:pt-36">
        <Eyebrow>Gallery · {organizationsIntro.label.toLowerCase()}</Eyebrow>
        <h2 ref={heading} id="orgs-title" className="mt-5 max-w-xl font-serif text-h2 font-bold">
          {organizationsIntro.heading}
        </h2>
        <p className="mt-4 max-w-sm text-muted">{organizationsIntro.lead}</p>

        {/* Live caption for the card at the centre of the fan */}
        {!reduced && (
          <div className="mt-8 hidden min-h-[7.5rem] max-w-xs md:block" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: BEZIER.reveal }}
              >
                <p className="eyebrow !text-[0.68rem]">
                  {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </p>
                <p className="mt-2 font-serif text-h3 font-bold">
                  {current.name} {current.generation}
                </p>
                <p className="text-muted">
                  {current.period}
                  {current.caseStudy ? ` · ${current.caseStudy.role}` : ''}
                </p>
                {current.caseStudy && (
                  <a
                    href={`#case-${current.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo(`#case-${current.id}`, { offset: -40 })
                    }}
                    className="mt-3 inline-flex items-center gap-2 text-caption font-bold text-cream underline-offset-4 hover:underline"
                  >
                    View case study <span aria-hidden>↓</span>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* The fan pivots around a point far below the screen, like the deck. */}
      <ul
        className={
          reduced
            ? 'container-page mt-12 grid grid-cols-2 gap-4 md:grid-cols-5'
            : 'absolute bottom-[24svh] left-1/2 h-[min(46svh,30rem)] w-[min(54vw,19rem)] -translate-x-1/2 md:bottom-[30svh] md:h-[min(44svh,26rem)] md:w-[min(22vw,18rem)]'
        }
      >
        {organizations.map((org, i) => {
          const body = <OrgCard org={org} />
          return (
            <li
              key={org.id}
              ref={(el) => void (cards.current[i] = el)}
              className={reduced ? 'aspect-[3/4]' : 'absolute inset-0 origin-[50%_260%] will-change-transform'}
            >
              {org.caseStudy ? (
                <a
                  href={`#case-${org.id}`}
                  data-cursor="Open"
                  aria-label={`${org.name} ${org.generation ?? ''} ${org.period} — view case study`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo(`#case-${org.id}`, { offset: -40 })
                  }}
                  className="block h-full rounded-card transition-transform duration-300 hover:-translate-y-2"
                >
                  {body}
                </a>
              ) : (
                <div className="h-full" aria-label={`${org.name} ${org.generation ?? ''} ${org.period}`}>
                  {body}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
