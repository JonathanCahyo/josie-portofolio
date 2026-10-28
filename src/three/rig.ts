/**
 * Stages: the sections that own a reel. Each reel is pinned to its section's
 * box and scrolls with it 1:1, like any other element on the page — it never
 * floats over text in the sections between stages.
 *
 * x / y — reel centre as a fraction of the half-viewport, measured from the
 *         centre of the section's first screen (1 = right/top edge)
 * s     — reel radius as a fraction of the half-viewport's shorter side
 * rx/ry — base tilt (radians); pointer tilt is added on top
 * spin  — idle spin speed (rad/s); scroll velocity rolls it further
 */
export type StagePose = { x: number; y: number; s: number; rx: number; ry: number; spin: number }

export const LABELS = ['JOSIE’S PORTOFOLIO', 'ORGANIZATIONS', 'PROJECT', 'THANK YOU'] as const

export type StageKey = 'hero' | 'toolkit' | 'gallery' | 'projects' | 'contact'

export type Stage = { key: StageKey; label: number; desktop: StagePose; mobile: StagePose }

const base: StagePose = { x: 0, y: 0, s: 0.5, rx: 0, ry: 0, spin: 0.12 }

export const STAGES: Stage[] = [
  {
    key: 'hero',
    label: 0,
    desktop: { ...base, x: 0.5, y: 0.36, s: 0.52, rx: 0.12, ry: -0.42, spin: 0.16 },
    mobile: { ...base, x: 0.05, y: 0.36, s: 0.62, rx: 0.1, ry: -0.3, spin: 0.16 },
  },
  {
    key: 'toolkit',
    label: 0,
    desktop: { ...base, x: 0, y: -0.02, s: 0.4, spin: 0.22 },
    mobile: { ...base, x: 0, y: 0.02, s: 0.5, spin: 0.22 },
  },
  {
    // the deck's half-circle dial under the fanned cards
    key: 'gallery',
    label: 1,
    desktop: { ...base, x: 0, y: -1.16, s: 0.98, spin: 0.04 },
    mobile: { ...base, x: 0, y: -1.02, s: 0.95, spin: 0.04 },
  },
  {
    key: 'projects',
    label: 2,
    desktop: { ...base, x: 0, y: -1.16, s: 0.98, spin: 0.04 },
    mobile: { ...base, x: 0, y: -1.02, s: 0.95, spin: 0.04 },
  },
  {
    key: 'contact',
    label: 3,
    desktop: { ...base, x: 0, y: 0.6, s: 0.26, rx: 0.08, spin: 0.1 },
    mobile: { ...base, x: 0, y: 0.62, s: 0.3, rx: 0.08, spin: 0.1 },
  },
]

export const isMobileLayout = () => typeof window !== 'undefined' && window.innerWidth < 768

const cache = new Map<string, HTMLElement>()

/** The section element carrying `data-scene="<key>"` (cached while it stays in the DOM). */
export function stageElement(key: string) {
  let el = cache.get(key)
  if (!el || !el.isConnected) {
    el = document.querySelector<HTMLElement>(`[data-scene="${key}"]`) ?? undefined
    if (el) cache.set(key, el)
  }
  return el ?? null
}

/** 0..1 — how fully a section occupies the viewport (fades satellites in and out). */
export function presence(rect: DOMRect, vh: number) {
  const enter = (vh - rect.top) / (vh * 0.6)
  const exit = rect.bottom / (vh * 0.6)
  return Math.max(0, Math.min(1, enter, exit))
}

/** Satellites of the toolkit reel (statement cylinder, tool tiles) read this. */
export const toolkitAnchor = { x: 0, y: 0, r: 1, halfW: 1, halfH: 1, vis: 0 }
