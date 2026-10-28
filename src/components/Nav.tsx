import { useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { nav, type NavId } from '../data/site'
import { ScrollTrigger } from '../animations/gsap'
import { useSmoothScroll } from '../animations/SmoothScroll'
import { SPRING } from '../animations/easing'
import { Logo } from './Logo'

/** Deck-style pill nav: the active item sits in a darker inset pill that slides between items. */
export function Nav() {
  const [active, setActive] = useState<NavId>('profile')
  const { scrollTo } = useSmoothScroll()

  // Active = the last [data-nav] block whose top has crossed 45% of the viewport.
  // Read from live rects so pinned sections (which hold still while pinned) count correctly.
  useLayoutEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-nav]'))
    const update = () => {
      const line = window.innerHeight * 0.45
      let current = els[0]
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el
      const id = current?.dataset.nav as NavId | undefined
      if (id) setActive((prev) => (prev === id ? prev : id))
    }
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update })
    update()
    return () => st.kill()
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="container-page flex items-center justify-between pt-5 md:pt-8">
        <nav aria-label="Primary" className="pill pointer-events-auto rounded-full p-1">
          <ul className="flex items-center">
            {nav.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id} className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#4d141d,#200b10)] shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_6px_16px_-6px_rgb(0_0_0/0.8)]"
                    />
                  )}
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo(`#${item.id}`)
                      history.replaceState(null, '', `#${item.id}`)
                    }}
                    className={`relative z-10 block rounded-full px-3 py-1.5 text-[0.95rem] transition-colors duration-200 sm:px-4 md:text-[1.05rem] ${
                      isActive ? 'font-bold text-fg' : 'text-fg/85 hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <a
          href="#profile"
          onClick={(e) => {
            e.preventDefault()
            scrollTo(0)
          }}
          className="pointer-events-auto hidden sm:block"
          aria-label="Josie's Portofolio — back to top"
        >
          <Logo />
        </a>
      </div>
    </header>
  )
}
