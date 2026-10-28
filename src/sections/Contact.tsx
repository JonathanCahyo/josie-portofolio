import { useRef } from 'react'
import { contact, site } from '../data/site'
import { credits } from '../data/credits'
import { img } from '../data/images'
import { useBlockReveal, useParallax, useSplitReveal } from '../animations/useReveal'
import { useSmoothScroll } from '../animations/SmoothScroll'
import { Eyebrow, LinkChip } from '../components/Bits'
import { MagneticButton } from '../components/Magnetic'
import { Media } from '../components/Media'
import { Logo } from '../components/Logo'

const still = img('hero-cinema', 'Josyca Nauli in a cinema seat holding a camera and pointing at herself')

export function Contact() {
  const heading = useRef<HTMLHeadingElement>(null)
  const actions = useRef<HTMLDivElement>(null)
  const roll = useRef<HTMLDivElement>(null)
  const photo = useRef<HTMLDivElement>(null)
  const { scrollTo } = useSmoothScroll()

  useSplitReveal(heading, { by: 'words', stagger: 0.06 })
  useBlockReveal(actions, { y: 24 })
  useBlockReveal(roll, { y: 40, stagger: 0.07 })
  useParallax(photo, 10)

  return (
    <section id="contact" data-nav="contact" data-scene="contact" aria-labelledby="contact-title" className="relative pt-[46svh] md:pt-[40svh]">
      <div className="container-page text-center">
        <Eyebrow className="justify-center">Contact</Eyebrow>
        <h2 ref={heading} id="contact-title" className="mx-auto mt-6 max-w-3xl font-serif text-h1 font-bold">
          {contact.heading}
        </h2>
        <div ref={actions}>
          <p data-reveal className="pill mx-auto mt-6 inline-block rounded-full px-6 py-2 text-body text-fg">
            {contact.tagline}
          </p>
          <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton variant="cream" href={`mailto:${contact.email}`}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 6 8.5 7 8.5-7" />
              </svg>
              {contact.email}
            </MagneticButton>
            <MagneticButton variant="pill" href={contact.instagram.href} external>
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
              @{contact.instagram.handle}
              <span className="sr-only">(Instagram, opens in a new tab)</span>
            </MagneticButton>
          </div>
          <div data-reveal className="mt-5 flex flex-wrap justify-center gap-3">
            {contact.more.map((l) => (
              <LinkChip key={l.label} link={l} />
            ))}
          </div>
        </div>
      </div>

      {/* End credits */}
      <div className="container-page mt-32 grid items-center gap-14 md:mt-44 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="overflow-hidden rounded-frame border border-white/10">
            <div ref={photo}>
              <Media image={still} className="aspect-[1440/828] w-full scale-110 object-cover" />
            </div>
          </div>
          <p className="mt-3 text-caption text-muted">
            {site.fullName} · {site.cohort}
          </p>
        </div>
        <div ref={roll} className="md:col-span-6 md:col-start-7">
          <div data-reveal>
            <Eyebrow>End credits</Eyebrow>
          </div>
          <ul className="mt-8">
            {credits.map((c) => (
              <li data-reveal key={c.work} className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-line py-4 last:border-b">
                <span className="font-serif text-h3 text-fg">{c.work}</span>
                <span className="eyebrow text-right !text-[0.66rem]">{c.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="container-page mt-32 flex flex-col items-center gap-6 border-t border-line py-12 text-center md:flex-row md:justify-between md:text-left">
        <Logo size="md" />
        <p className="text-caption text-muted">
          © {new Date().getFullYear()} {site.name} · {site.study}, {site.university}
        </p>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="text-caption font-bold text-fg underline-offset-4 hover:underline"
        >
          Back to top ↑
        </button>
      </footer>
    </section>
  )
}
