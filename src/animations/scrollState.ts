/**
 * Mutable, render-free state shared between the DOM scroll layer and the
 * WebGL scene. Written by Lenis/ScrollTrigger, read inside useFrame.
 */
export const scrollState = {
  /** Lenis velocity (px/frame, signed) */
  velocity: 0,
  /** Whole-page progress 0..1 */
  progress: 0,
}

/** Normalised pointer, -1..1 on both axes (y up), plus smoothed speed. */
export const pointerState = {
  x: 0,
  y: 0,
  speed: 0,
}

if (typeof window !== 'undefined') {
  let lx = 0
  let ly = 0
  window.addEventListener(
    'pointermove',
    (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointerState.speed = Math.min(1, pointerState.speed + Math.hypot(x - lx, y - ly) * 2)
      pointerState.x = lx = x
      pointerState.y = ly = y
    },
    { passive: true },
  )
}
