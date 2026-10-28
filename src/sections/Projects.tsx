import { useLayoutEffect, useRef, useState } from 'react'
import { projects, projectsIntro } from '../data/projects'
import type { Project } from '../data/types'
import { gsap } from '../animations/gsap'
import { useSplitReveal } from '../animations/useReveal'
import { useSmoothScroll } from '../animations/SmoothScroll'
import { Eyebrow, LinkChip } from '../components/Bits'
import { Media } from '../components/Media'
import { useLightbox } from '../components/Lightbox'

/**
 * Collage positions per project (desktop), echoing each deck slide.
 * l/t/w are % of the media box; depth drives horizontal parallax.
 */
const COLLAGE: Record<string, { box: string; items: Array<{ l: number; t: number; w: number; depth: number; r?: number }> }> = {
  pulitzer: {
    box: 'aspect-[16/11]',
    items: [
      { l: 0, t: 3, w: 46, depth: 0.4 },
      { l: 3, t: 56, w: 43, depth: -0.3 },
      { l: 50, t: 0, w: 24, depth: 0.8, r: -2 },
      { l: 76, t: 7, w: 24, depth: 1.2, r: 2 },
    ],
  },
  idn: {
    box: 'aspect-[16/10]',
    items: [
      { l: 0, t: 0, w: 44, depth: 0.3 },
      { l: 50, t: 10, w: 28, depth: 0.9, r: -1.5 },
      { l: 80, t: 16, w: 20, depth: 1.4, r: 2 },
    ],
  },
  keruh: {
    box: 'aspect-[16/11.5]',
    items: [
      { l: 0, t: 0, w: 62, depth: 0.4 },
      { l: 4, t: 50, w: 36, depth: -0.4 },
      { l: 66, t: 12, w: 34, depth: 1.1 },
    ],
  },
}

function ProjectPanel({ project, index }: { project: Project; index: number }) {
  const open = useLightbox()
  const collage = COLLAGE[project.id]
  return (
    <article
      id={`project-${project.id}`}
      aria-labelledby={`project-${project.id}-title`}
      className="project-panel relative flex min-h-[100svh] w-full shrink-0 items-center py-24 lg:h-full lg:w-screen lg:py-0"
    >
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow !text-[0.68rem]">
            {String(index + 1).padStart(2, '0')} · {project.kicker} · {project.year}
          </p>
          <h3 id={`project-${project.id}-title`} className="mt-5 font-serif text-h2 font-bold text-fg">
            {project.title}
          </h3>
          {project.subtitle && <p className="mt-3 font-serif text-body-lg text-fg/90 italic">{project.subtitle}</p>}
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Roles">
            {project.roles.map((r) => (
              <li key={r} className="rounded-full bg-cream px-3.5 py-1 text-caption font-bold text-accent">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-body text-muted">{project.summary}</p>
          <dl className="mt-8 space-y-3">
            {project.facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[8.5rem_1fr] gap-3 border-t border-line pt-3 text-caption">
                <dt className="eyebrow !text-[0.66rem] leading-5">{f.label}</dt>
                <dd className="text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.map((l) => (
              <LinkChip key={l.label} link={l} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* desktop collage */}
          <div className={`relative hidden lg:block ${collage.box}`}>
            {project.media.map((m, i) => {
              const p = collage.items[i]
              return (
                <button
                  key={m.src}
                  type="button"
                  data-depth={p.depth}
                  data-cursor="View"
                  onClick={() => open(m)}
                  className="absolute overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] transition-[box-shadow,border-color] duration-300 hover:border-cream/40"
                  style={{ left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%`, rotate: p.r ? `${p.r}deg` : undefined }}
                  aria-label={`${m.alt} — open image`}
                >
                  <Media image={m} className="h-auto w-full" />
                </button>
              )
            })}
          </div>
          {/* mobile / tablet stack */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {project.media.map((m, i) => (
              <button
                key={m.src}
                type="button"
                onClick={() => open(m)}
                className={`overflow-hidden rounded-2xl border border-white/10 ${i === 0 ? 'col-span-2' : ''}`}
                aria-label={`${m.alt} — open image`}
              >
                <Media image={m} className={`w-full object-cover ${i === 0 ? '' : 'aspect-[3/4]'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export function Projects() {
  const intro = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const stage = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [chapter, setChapter] = useState(0)
  const { scrollTo } = useSmoothScroll()

  useSplitReveal(heading, { by: 'words' })

  useLayoutEffect(() => {
    const el = stage.current
    const tr = track.current
    if (!el || !tr) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => tr.scrollWidth - window.innerWidth
      const scroll = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
            setChapter(Math.min(projects.length - 1, Math.round(self.progress * (projects.length - 1))))
          },
        },
      })
      // depth parallax inside each panel, driven by the horizontal scroll
      gsap.utils.toArray<HTMLElement>('[data-depth]', tr).forEach((m) => {
        const depth = Number(m.dataset.depth)
        gsap.fromTo(
          m,
          { xPercent: depth * 18 },
          {
            xPercent: -depth * 18,
            ease: 'none',
            scrollTrigger: {
              trigger: m.closest('.project-panel'),
              containerAnimation: scroll,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        )
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <>
      <section
        ref={intro}
        data-nav="gallery"
        data-scene="projects"
        aria-labelledby="projects-title"
        className="relative flex min-h-[100svh] flex-col pt-28 md:pt-36"
      >
        <div className="container-page">
          <Eyebrow>Gallery · {projectsIntro.label.toLowerCase()}</Eyebrow>
          <h2 ref={heading} id="projects-title" className="mt-5 max-w-xl font-serif text-h2 font-bold">
            {projectsIntro.heading}
          </h2>
          <p className="mt-4 max-w-sm text-muted">{projectsIntro.lead}</p>
          <ol className="glass relative z-10 mt-10 max-w-xl rounded-3xl px-6">
            {projects.map((p, i) => (
              <li key={p.id} className="border-b border-line last:border-b-0">
                <a
                  href={`#project-${p.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    // Inside the pinned horizontal track, chapter i sits i viewport-widths into the pin.
                    const top = (stage.current?.getBoundingClientRect().top ?? 0) + window.scrollY
                    const wide = window.matchMedia('(min-width: 1024px)').matches
                    scrollTo(wide && stage.current ? top + i * window.innerWidth + 2 : `#project-${p.id}`)
                  }}
                  className="group flex items-baseline gap-5 py-4 transition-colors hover:text-cream"
                >
                  <span className="font-serif text-caption text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-h3 leading-snug font-bold">{p.title}</span>
                  <span aria-hidden className="ml-auto translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section ref={stage} data-nav="gallery" aria-label="Projects" className="relative lg:h-[100svh] lg:overflow-hidden">
        <div ref={track} className="flex flex-col lg:h-full lg:w-max lg:flex-row">
          {projects.map((p, i) => (
            <ProjectPanel key={p.id} project={p} index={i} />
          ))}
        </div>
        {/* chapter progress (desktop pin only) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden lg:block" aria-hidden>
          <div className="container-page flex items-center gap-5">
            <span className="font-serif text-caption text-fg">
              {String(chapter + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
            <div className="h-px flex-1 bg-line">
              <div ref={bar} className="h-px origin-left scale-x-0 bg-cream" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
