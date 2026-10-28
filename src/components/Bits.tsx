import type { ReactNode } from 'react'
import type { MaybeLink, Rich } from '../data/types'

/** Renders data-driven rich text (plain strings + { b } emphasis). */
export function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) => (typeof p === 'string' ? p : <strong key={i} className="font-bold text-fg">{p.b}</strong>))}
    </>
  )
}

/** Small serif caps label with a leading rule — the deck's "Design / Documentation" tags. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      <span aria-hidden className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  )
}

/**
 * A link that may still be missing. Without href it renders a visibly
 * dashed "coming soon" chip so placeholders are obvious, not broken.
 */
export function LinkChip({ link }: { link: MaybeLink }) {
  if (!link.href) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-muted/50 px-5 py-2.5 text-caption text-muted"
        title={link.todo ? `Placeholder — ${link.todo}` : 'Placeholder'}
      >
        {link.label}
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[0.7rem] tracking-wider uppercase">Link soon</span>
      </span>
    )
  }
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-caption font-bold text-fg transition hover:brightness-125"
    >
      {link.label} <span aria-hidden>↗</span>
    </a>
  )
}
