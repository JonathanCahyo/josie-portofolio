import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { Polaroid as PolaroidData } from '../data/types'
import { Media } from './Media'
import { useLightbox } from './Lightbox'
import { SPRING } from '../animations/easing'
import { useReducedMotion } from '../hooks/useMedia'

/** Instant-film print: straightens and lifts on hover, opens the lightbox on click. */
export function Polaroid({
  item,
  rotate = 0,
  aspect = '4/3',
  className = '',
  style,
}: {
  item: PolaroidData
  rotate?: number
  aspect?: string
  className?: string
  style?: CSSProperties
}) {
  const open = useLightbox()
  const reduced = useReducedMotion()
  return (
    <motion.button
      type="button"
      data-cursor="View"
      data-polaroid
      onClick={() => open(item)}
      className={`block bg-[#f7f3ee] p-[4%] pb-[3%] text-left shadow-[0_24px_40px_-18px_rgb(0_0_0/0.75)] ${className}`}
      style={{ rotate, ...style }}
      whileHover={reduced ? undefined : { rotate: 0, scale: 1.05, zIndex: 30 }}
      whileFocus={{ zIndex: 30 }}
      transition={SPRING}
      aria-label={`${item.caption || item.alt} — open image`}
    >
      <span className="block overflow-hidden bg-surface" style={{ aspectRatio: aspect }}>
        <Media image={item} className="h-full w-full object-cover" />
      </span>
      <span className="block min-h-[2.6em] pt-[0.55em] text-center text-[clamp(0.62rem,0.55rem+0.25vw,0.8rem)] leading-tight text-accent">
        {item.caption}
      </span>
    </motion.button>
  )
}
