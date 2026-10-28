import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Img } from '../data/types'
import { Media } from './Media'
import { useSmoothScroll } from '../animations/SmoothScroll'
import { BEZIER } from '../animations/easing'
import { sound } from '../audio/sound'

type Item = Img & { caption?: string }
const Ctx = createContext<(item: Item) => void>(() => {})
export const useLightbox = () => useContext(Ctx)

/** Full-screen image viewer. Esc / click outside closes; focus returns to the opener. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<Item | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const { lenis } = useSmoothScroll()

  const open = useCallback(
    (next: Item) => {
      opener.current = document.activeElement as HTMLElement | null
      setItem(next)
      sound.shutter()
      lenis()?.stop()
    },
    [lenis],
  )
  const close = useCallback(() => {
    setItem(null)
    lenis()?.start()
    opener.current?.focus()
  }, [lenis])

  useEffect(() => {
    if (!item) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, close])

  return (
    <Ctx.Provider value={open}>
      {children}
      <AnimatePresence>
        {item && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={item.caption || item.alt}
            className="fixed inset-0 z-[75] flex items-center justify-center bg-bg-deep/92 p-4 backdrop-blur-md md:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: BEZIER.cine }}
            onClick={close}
          >
            <motion.figure
              className="flex max-h-full max-w-5xl flex-col items-center gap-4"
              initial={{ y: 40, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.6, ease: BEZIER.reveal }}
              onClick={(e) => e.stopPropagation()}
            >
              <Media image={item} eager className="max-h-[78svh] w-auto rounded-frame object-contain shadow-2xl" />
              {(item.caption || item.alt) && (
                <figcaption className="max-w-2xl text-center text-caption text-muted">{item.caption || item.alt}</figcaption>
              )}
            </motion.figure>
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              className="pill absolute top-5 right-5 rounded-full px-5 py-2 text-caption font-bold text-fg md:top-8 md:right-8"
            >
              Close <span aria-hidden>✕</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}
