import { useSyncExternalStore } from 'react'

function subscribeTo(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'
export const DESKTOP = '(min-width: 1024px)'

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION)
export const useFinePointer = () => useMediaQuery(FINE_POINTER)
export const useIsDesktop = () => useMediaQuery(DESKTOP)

/** Non-reactive read for module-level setup code. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches
