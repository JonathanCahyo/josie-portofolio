import type { ImgHTMLAttributes } from 'react'
import type { Img } from '../data/types'
import { asset } from '../lib/asset'

/** <img> with intrinsic size (no layout shift), lazy decoding and base-aware src. */
export function Media({
  image,
  className = '',
  eager = false,
  ...rest
}: { image: Img; eager?: boolean } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'>) {
  return (
    <img
      src={asset(image.src)}
      alt={image.alt}
      width={image.w}
      height={image.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={className}
      {...rest}
    />
  )
}
