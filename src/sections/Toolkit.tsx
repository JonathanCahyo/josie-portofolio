import { useContext, useLayoutEffect, useRef } from 'react'
import { toolkit } from '../data/about'
import { gsap } from '../animations/gsap'
import { prefersReducedMotion } from '../hooks/useMedia'
import { Eyebrow } from '../components/Bits'
import { SceneContext } from '../three/SceneContext'

/**
 * Pinned stage for the 3D statement: while pinned, the reel sits centre,
 * "GRAPHIC DESIGNER" wraps around it on a cylinder and the tool tiles orbit.
 * Without a live scene the statement is rendered as type instead.
 */
export function Toolkit() {
  const root = useRef<HTMLElement>(null)
  const { live } = useContext(SceneContext)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const st = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top top', end: '+=110%', pin: true, scrub: true },
    })
    st.fromTo(el.querySelector('.toolkit-caption'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3 })
      .to({}, { duration: 0.7 })
    return () => {
      st.scrollTrigger?.kill()
      st.kill()
    }
  }, [])

  return (
    <section ref={root} data-nav="about" data-scene="toolkit" aria-labelledby="toolkit-title" className="relative h-[100svh] overflow-hidden">
      <div className="container-page flex h-full flex-col justify-between pt-28 pb-10 md:pt-36 md:pb-14">
        <Eyebrow>Role &amp; Toolkit</Eyebrow>

        <h2
          id="toolkit-title"
          className={
            live
              ? 'sr-only'
              : 'text-center font-condensed text-[min(9rem,17vw)] leading-[0.9] font-semibold tracking-tight text-cream uppercase'
          }
        >
          {toolkit.statement}
        </h2>

        <div className="toolkit-caption text-center">
          <p className="eyebrow mb-3">Tools of the trade</p>
          <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-2 gap-y-2">
            {toolkit.tools.map((t) => (
              <li key={t.name} className="glass rounded-full px-4 py-1.5 text-caption text-fg">
                <span className="mr-2 font-serif font-bold text-cream">{t.mono}</span>
                {t.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
