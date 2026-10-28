import { useLayoutEffect, useRef } from 'react'
import { about } from '../data/about'
import { gsap } from '../animations/gsap'
import { useSplitReveal } from '../animations/useReveal'
import { prefersReducedMotion } from '../hooks/useMedia'
import { Eyebrow, RichText } from '../components/Bits'
import { Media } from '../components/Media'

export function About() {
  const heading = useRef<HTMLHeadingElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)

  useSplitReveal(heading, { by: 'words' })
  useSplitReveal(body, { by: 'lines', stagger: 0.05, start: 'top 80%' })

  // Portrait unveils like a projector shutter, then drifts inside its frame.
  useLayoutEffect(() => {
    const el = frame.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(el, {
        clipPath: 'inset(100% 0% 0% 0% round 1.75rem)',
        duration: 1.4,
        ease: 'cine',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      })
      gsap.fromTo(
        el.querySelector('img'),
        { scale: 1.18, yPercent: -6 },
        { scale: 1.04, yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" data-nav="about" className="relative py-28 md:py-40">
      <div className="container-page grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7 lg:col-span-6">
          <Eyebrow>About</Eyebrow>
          <h2 ref={heading} className="mt-6 font-serif text-h1 font-bold text-fg">
            {about.greeting}
          </h2>
          <div ref={body} className="mt-8 space-y-6 text-body-lg text-muted">
            {about.paragraphs.map((p, i) => (
              <p key={i}>
                <RichText parts={p} />
              </p>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 lg:col-span-5 lg:col-start-8">
          <div
            ref={frame}
            className="relative overflow-hidden rounded-frame border border-white/10 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)] [clip-path:inset(0%_0%_0%_0%_round_1.75rem)]"
          >
            <Media image={about.portrait} className="aspect-[1100/1326] h-auto w-full object-cover" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgb(30_8_12/0.55))]" />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
            {about.facts.map((f) => (
              <div key={f.label} className="border-t border-line pt-3">
                <dt className="eyebrow !text-[0.68rem]">{f.label}</dt>
                <dd className="mt-1 font-serif text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
