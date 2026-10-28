import { useLayoutEffect, useRef } from 'react'
import { caseStudyOrder, organizations } from '../data/organizations'
import type { Organization, Polaroid as PolaroidData } from '../data/types'
import { gsap } from '../animations/gsap'
import { useSplitReveal } from '../animations/useReveal'
import { prefersReducedMotion } from '../hooks/useMedia'
import { Eyebrow, LinkChip } from '../components/Bits'
import { Media } from '../components/Media'
import { Polaroid } from '../components/Polaroid'
import { useLightbox } from '../components/Lightbox'

/**
 * Desktop polaroid layout, after the deck: a straight right-hand column with
 * tilted prints overlapping from the left. Values are % of the stack box.
 */
const STACK: Array<{ l: number; t: number; w: number; r: number; aspect: string }> = [
  { l: 40, t: 0, w: 60, r: 0, aspect: '4/3' },
  { l: 0, t: 9, w: 52, r: 8, aspect: '16/10' },
  { l: 40, t: 33.5, w: 60, r: 0, aspect: '4/3' },
  { l: 1, t: 38, w: 52, r: -10, aspect: '16/10' },
  { l: 3, t: 65, w: 50, r: 8, aspect: '16/9' },
  { l: 40, t: 67, w: 60, r: 0, aspect: '4/3' },
]
/** Paint order: straight prints first, tilted ones on top. */
const PAINT = [0, 2, 5, 1, 3, 4]

function PolaroidStack({ items }: { items: PolaroidData[] }) {
  return (
    <>
      <div className="relative hidden aspect-[5/8] lg:block">
        {PAINT.filter((i) => items[i]).map((i) => {
          const p = STACK[i]
          return (
            <div
              key={i}
              data-drop
              data-tilt={p.r}
              className="absolute"
              style={{ left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%` }}
            >
              <Polaroid item={items[i]} rotate={p.r} aspect={p.aspect} className="w-full" />
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {items.map((item, i) => (
          <div key={i} data-drop data-tilt={i % 2 ? 3 : -3}>
            <Polaroid item={item} rotate={i % 2 ? 3 : -3} className="w-full" />
          </div>
        ))}
      </div>
    </>
  )
}

function CaseStudy({ org, index, total }: { org: Organization; index: number; total: number }) {
  const cs = org.caseStudy!
  const root = useRef<HTMLElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const open = useLightbox()

  useSplitReveal(title, { by: 'words' })

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 50,
        autoAlpha: 0,
        duration: 1.1,
        stagger: 0.08,
        scrollTrigger: { trigger: el.querySelector('[data-grid]'), start: 'top 78%', once: true },
      })
      // prints drop onto the table one by one
      gsap.utils.toArray<HTMLElement>('[data-drop]').forEach((d, i) => {
        if (!d.offsetParent) return
        gsap.from(d, {
          y: -80,
          rotate: Number(d.dataset.tilt ?? 0) * 1.8,
          autoAlpha: 0,
          duration: 1,
          delay: i * 0.09,
          ease: 'reveal',
          scrollTrigger: { trigger: d.parentElement, start: 'top 75%', once: true },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const number = String(index + 1).padStart(2, '0')

  return (
    <article ref={root} id={`case-${org.id}`} aria-labelledby={`case-${org.id}-title`} className="relative py-24 md:py-32">
      <div className="container-page">
        <header className="grid gap-6 border-b border-line pb-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow !text-[0.68rem]">
              Case study {number} / {String(total).padStart(2, '0')} · {org.period}
            </p>
            <h3 ref={title} id={`case-${org.id}-title`} className="mt-4 font-serif text-h1 font-bold">
              {org.name} {org.generation}
            </h3>
          </div>
          <div className="md:col-span-4 md:text-right">
            <p className="font-serif text-h3 text-cream">{cs.role}</p>
            {cs.division && <p className="mt-1 text-muted">{cs.division}</p>}
          </div>
        </header>

        <div data-grid className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Design work */}
          <div className="lg:col-span-4">
            {cs.designs.length > 0 && (
              <>
                <Eyebrow className="!text-cream">{cs.designsTitle}</Eyebrow>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {cs.designs.map((d) => (
                    <button
                      key={d.src}
                      type="button"
                      data-reveal
                      data-cursor="View"
                      onClick={() => open(d)}
                      className="group overflow-hidden rounded-2xl border border-white/10"
                      aria-label={`${d.alt} — open image`}
                    >
                      <Media image={d} className="aspect-[4/5] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-reveal)] group-hover:scale-[1.06]" />
                    </button>
                  ))}
                </div>
              </>
            )}
            {cs.extra && (
              <div className={cs.designs.length ? 'mt-10' : ''} data-reveal>
                <Eyebrow className="!text-cream">{cs.extra.title}</Eyebrow>
                <button
                  type="button"
                  data-cursor="View"
                  onClick={() => open(cs.extra!.image)}
                  className="mt-6 block w-full overflow-hidden rounded-2xl border border-white/10"
                  aria-label={`${cs.extra.image.alt} — open image`}
                >
                  <Media image={cs.extra.image} className="w-full object-cover" />
                </button>
              </div>
            )}
          </div>

          {/* Member card + story */}
          <div className="lg:col-span-4">
            <div data-reveal className="glass mx-auto max-w-sm rounded-card p-3 pb-3">
              <div className="flex items-baseline justify-between px-3 pt-2 pb-3">
                <div>
                  <p className="font-serif text-xl leading-tight font-bold">{org.name}</p>
                  {org.generation && <p className="font-serif text-fg/90">{org.generation}</p>}
                </div>
                <p className="text-caption text-muted">{org.period}</p>
              </div>
              <button
                type="button"
                data-cursor="View"
                onClick={() => open(org.cover)}
                className="block w-full overflow-hidden rounded-[1.6rem]"
                aria-label={`${org.cover.alt} — open image`}
              >
                <Media image={org.cover} className="w-full object-cover" />
              </button>
              <p className="px-3 pt-3 pb-1 text-center text-caption text-muted">
                <span className="font-serif font-bold text-fg">{cs.memberCard.name}</span> · {cs.memberCard.label}
              </p>
            </div>
            <p data-reveal className="mx-auto mt-8 max-w-md text-center text-body-lg text-muted">
              {cs.summary}
            </p>
            {cs.links.length > 0 && (
              <div data-reveal className="mt-6 flex flex-wrap justify-center gap-3">
                {cs.links.map((l) => (
                  <LinkChip key={l.label} link={l} />
                ))}
              </div>
            )}
          </div>

          {/* Documentation */}
          <div className="lg:col-span-4">
            <Eyebrow className="!text-cream">Documentation</Eyebrow>
            <div className="mt-6">
              <PolaroidStack items={cs.documentation} />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function CaseStudies() {
  const list = caseStudyOrder.map((id) => organizations.find((o) => o.id === id)!).filter((o) => o.caseStudy)
  return (
    <div data-nav="gallery" aria-label="Organization case studies">
      {list.map((org, i) => (
        <CaseStudy key={org.id} org={org} index={i} total={list.length} />
      ))}
    </div>
  )
}
