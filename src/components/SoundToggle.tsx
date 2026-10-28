import { useSyncExternalStore } from 'react'
import { sound } from '../audio/sound'

/** Small speaker icon that switches the cinema sound layer on/off. */
export function SoundToggle() {
  const on = useSyncExternalStore(sound.subscribe, sound.isOn, () => false)

  return (
    <button
      type="button"
      data-sound-toggle
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      onClick={() => void sound.setOn(!on)}
      className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/10 hover:text-fg ${
        on ? 'text-fg' : 'text-fg/60'
      }`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" fillOpacity="0.15" />
        {on ? (
          <>
            <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
            <path d="M18 6.8a7.5 7.5 0 0 1 0 10.4" />
          </>
        ) : (
          <path d="m16 9.5 5 5m0-5-5 5" />
        )}
      </svg>
    </button>
  )
}
