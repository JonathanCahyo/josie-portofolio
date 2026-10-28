/**
 * Scene "rig": the single set of numbers the WebGL scene reads every frame.
 * GSAP ScrollTriggers tween it from pose to pose as sections enter, so the
 * reel travels through the page as one continuous object.
 *
 * x / y  — reel centre as a fraction of the half-viewport (1 = right/top edge)
 * s      — reel radius as a fraction of the half-viewport's shorter side
 * rx/ry  — base tilt (radians); pointer tilt is added on top
 * spin   — idle spin speed (rad/s); scroll velocity adds to it
 * label  — which ring label is shown (index into LABELS, cross-faded)
 * cyl    — "GRAPHIC DESIGNER" cylinder visibility 0..1
 * tiles  — tool tiles visibility 0..1
 * ribbon — film-strip ribbon opacity 0..1
 * cam    — camera dolly (-1 closer … 1 farther)
 */
export type Pose = {
  x: number
  y: number
  s: number
  rx: number
  ry: number
  spin: number
  label: number
  cyl: number
  tiles: number
  ribbon: number
  cam: number
}

export const LABELS = ['JOSIE’S PORTOFOLIO', 'ORGANIZATIONS', 'PROJECT', 'THANK YOU'] as const

const base: Pose = { x: 0, y: 0, s: 0.5, rx: 0, ry: 0, spin: 0.12, label: 0, cyl: 0, tiles: 0, ribbon: 0.4, cam: 0 }

export type SceneKey = 'hero' | 'about' | 'toolkit' | 'gallery' | 'cases' | 'projects' | 'chapters' | 'contact' | 'credits'

export const POSES: Record<SceneKey, { desktop: Pose; mobile: Pose }> = {
  hero: {
    desktop: { ...base, x: 0.5, y: 0.36, s: 0.52, rx: 0.12, ry: -0.42, spin: 0.16, ribbon: 1 },
    mobile: { ...base, x: 0.05, y: 0.36, s: 0.62, rx: 0.1, ry: -0.3, spin: 0.16, ribbon: 1 },
  },
  about: {
    desktop: { ...base, x: -0.86, y: -0.7, s: 0.42, rx: 0.55, ry: 0.65, ribbon: 0.45 },
    mobile: { ...base, x: 0.85, y: 0.82, s: 0.42, rx: 0.4, ry: -0.6, ribbon: 0.35 },
  },
  toolkit: {
    desktop: { ...base, x: 0, y: -0.02, s: 0.4, spin: 0.22, cyl: 1, tiles: 1, ribbon: 0.2, cam: -0.4 },
    mobile: { ...base, x: 0, y: 0.02, s: 0.5, spin: 0.22, cyl: 1, tiles: 1, ribbon: 0.2, cam: -0.2 },
  },
  gallery: {
    desktop: { ...base, x: 0, y: -1.16, s: 0.98, spin: 0.04, label: 1, ribbon: 0.35 },
    mobile: { ...base, x: 0, y: -1.02, s: 0.95, spin: 0.04, label: 1, ribbon: 0.35 },
  },
  cases: {
    desktop: { ...base, x: 1.1, y: -1.05, s: 0.4, rx: 0.3, ry: -0.6, spin: 0.1, label: 1, ribbon: 0.15 },
    mobile: { ...base, x: 1.05, y: -1.0, s: 0.45, rx: 0.3, ry: -0.5, spin: 0.1, label: 1, ribbon: 0.1 },
  },
  projects: {
    desktop: { ...base, x: 0, y: -1.16, s: 0.98, spin: 0.04, label: 2, ribbon: 0.35 },
    mobile: { ...base, x: 0, y: -1.02, s: 0.95, spin: 0.04, label: 2, ribbon: 0.35 },
  },
  chapters: {
    desktop: { ...base, x: -1.1, y: -1.12, s: 0.42, rx: 0.2, ry: 0.5, spin: 0.08, label: 2, ribbon: 0.2 },
    mobile: { ...base, x: -1.1, y: -1.1, s: 0.4, rx: 0.2, ry: 0.4, spin: 0.08, label: 2, ribbon: 0.1 },
  },
  contact: {
    desktop: { ...base, x: 0, y: 0.6, s: 0.26, rx: 0.08, spin: 0.1, label: 3, ribbon: 0.9, cam: 0.6 },
    mobile: { ...base, x: 0, y: 0.62, s: 0.3, rx: 0.08, spin: 0.1, label: 3, ribbon: 0.7, cam: 0.4 },
  },
  // end credits: the reel rolls off the top of the frame
  credits: {
    desktop: { ...base, x: 0.3, y: 1.7, s: 0.26, rx: 0.4, spin: 0.3, label: 3, ribbon: 0.5, cam: 0.6 },
    mobile: { ...base, x: 0.3, y: 1.7, s: 0.3, rx: 0.4, spin: 0.3, label: 3, ribbon: 0.4, cam: 0.4 },
  },
}

export const isMobileLayout = () => typeof window !== 'undefined' && window.innerWidth < 768

export const rig: Pose = { ...POSES.hero.desktop }

export function resetRig() {
  Object.assign(rig, isMobileLayout() ? POSES.hero.mobile : POSES.hero.desktop)
}
