/**
 * The three global motion curves. Mirrored in CSS as --ease-reveal / --ease-cine / --ease-spring.
 * - reveal: fast-out, long settle — text and image entrances
 * - cine:   symmetric in-out — camera moves, pinned transitions, scroll-to
 * - spring: physical response — hover, magnetic, cursor
 */
export const BEZIER = {
  reveal: [0.16, 1, 0.3, 1],
  cine: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, [number, number, number, number]>

export const SPRING = { type: 'spring', stiffness: 300, damping: 30, mass: 0.6 } as const

export const DURATION = {
  micro: 0.2,
  component: 0.6,
  section: 1.1,
} as const

/** Same curve as BEZIER.cine, for Lenis.scrollTo (expects t → eased t). */
export function easeCine(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
