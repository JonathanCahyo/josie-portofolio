export type Quality = 'high' | 'low'

/** Coarse device tiering: phones/tablets and low-core machines get the light scene. */
export function detectQuality(): Quality {
  if (typeof window === 'undefined') return 'low'
  const small = window.innerWidth < 768
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency ?? 4
  return small || coarse || cores <= 4 ? 'low' : 'high'
}
