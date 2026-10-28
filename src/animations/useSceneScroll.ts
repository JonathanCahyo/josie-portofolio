import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from './gsap'
import { POSES, rig, type Pose, type SceneKey } from '../three/rig'
import { prefersReducedMotion } from '../hooks/useMedia'

/**
 * Tweens the 3D rig from one section's pose to the next as each
 * `[data-scene]` element scrolls into view. Must run after sections have
 * created their own pins (parent effects run after children), so trigger
 * positions account for pin spacing.
 */
export function useSceneScroll(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled || prefersReducedMotion()) return
    const mm = gsap.matchMedia()

    const build = (variant: 'desktop' | 'mobile') => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
      let prev: Pose | null = null
      els.forEach((el) => {
        const pose = POSES[el.dataset.scene as SceneKey]?.[variant]
        if (!pose) return
        if (!prev) {
          Object.assign(rig, pose)
        } else {
          gsap.fromTo(rig, { ...prev }, {
            ...pose,
            ease: 'cine',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'top 15%',
              scrub: 0.6,
            },
          })
        }
        prev = pose
      })
      ScrollTrigger.refresh()
    }

    mm.add('(min-width: 768px)', () => build('desktop'))
    mm.add('(max-width: 767.98px)', () => build('mobile'))
    return () => mm.revert()
  }, [enabled])
}
