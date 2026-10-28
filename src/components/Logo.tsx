import { site } from '../data/site'

/** The deck's lockup: script "josie's" riding on an outlined serif "PORTOFOLIO". */
export function Logo({ className = '', size = 'sm' }: { className?: string; size?: 'sm' | 'md' }) {
  const big = size === 'md'
  return (
    <span className={`relative inline-flex flex-col leading-none select-none ${className}`} aria-label="Josie's Portofolio">
      <span
        aria-hidden
        className={`font-script text-fg ${big ? 'text-5xl' : 'text-[1.9rem]'} -mb-2 ml-1 leading-none`}
      >
        {site.brand.script}
      </span>
      <span
        aria-hidden
        className={`font-display font-black tracking-[0.02em] text-outline ${big ? 'text-2xl' : 'text-[0.95rem]'} ml-5 [-webkit-text-stroke-width:0.8px]`}
      >
        {site.brand.word}
      </span>
    </span>
  )
}
