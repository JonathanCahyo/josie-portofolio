import { useSyncExternalStore } from 'react'
import { sound } from '../audio/sound'
import { useReducedMotion } from '../hooks/useMedia'

const BARS = [0.45, 0.9, 0.6, 1, 0.5]

/** Pill button that switches the cinema sound layer on/off; bars dance while it plays. */
export function SoundToggle() {
  const on = useSyncExternalStore(sound.subscribe, sound.isOn, () => false)
  const reduced = useReducedMotion()

  return (
    <button
      type="button"
      data-sound-toggle
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      onClick={() => void sound.setOn(!on)}
      className="pill pointer-events-auto flex h-11 items-center gap-2 rounded-full px-4 text-caption font-bold text-fg transition hover:brightness-125"
    >
      <span aria-hidden className="flex h-4 items-end gap-[3px]">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="w-[3px] origin-bottom rounded-full bg-cream"
            style={{
              height: '100%',
              transform: `scaleY(${on ? h : 0.2})`,
              transition: 'transform 300ms var(--ease-reveal)',
              animation: on && !reduced ? `sound-bar 0.9s ${i * 0.12}s ease-in-out infinite alternate` : 'none',
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">{on ? 'Sound on' : 'Sound off'}</span>
      <style>{`@keyframes sound-bar { from { transform: scaleY(0.25); } to { transform: scaleY(1); } }`}</style>
    </button>
  )
}
