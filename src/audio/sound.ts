/**
 * Cinema sound layer, synthesised with the Web Audio API — no audio files,
 * nothing to license, nothing extra to download.
 *
 * Off by default. Browsers only allow audio after a user gesture, so the
 * context is created when the visitor turns sound on (or, if they turned it
 * on before, on their first click/key press of the visit).
 *
 * - projector: soft motor hum + 24 fps shutter clatter (ambient loop)
 * - reel tick: a dry tick every stretch of scrolled distance, louder when fast
 * - hover click, nav tick, camera shutter for the lightbox, leader beep
 * Under prefers-reduced-motion the ambient loop and scroll ticks stay off.
 */
import { prefersReducedMotion } from '../hooks/useMedia'

const STORAGE_KEY = 'josie-sound'
const MASTER = 0.55

type Listener = (on: boolean) => void

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let ambient: { gain: GainNode; stop: () => void } | null = null
let enabled = false
const listeners = new Set<Listener>()

function readPref() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}
function writePref(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    /* storage unavailable — preference just isn't remembered */
  }
}

function ensureContext() {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = MASTER
  master.connect(ctx.destination)
  // one second of white noise, reused by every noisy voice
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return ctx
}

const live = () => (enabled && ctx && master && ctx.state === 'running' ? ctx : null)

function noiseBurst(c: AudioContext, opts: { at?: number; dur: number; gain: number; type: BiquadFilterType; freq: number; q?: number }) {
  const t = opts.at ?? c.currentTime
  const src = c.createBufferSource()
  src.buffer = noise
  src.playbackRate.value = 0.8 + Math.random() * 0.4
  const filter = c.createBiquadFilter()
  filter.type = opts.type
  filter.frequency.value = opts.freq
  filter.Q.value = opts.q ?? 1
  const g = c.createGain()
  g.gain.setValueAtTime(opts.gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)
  src.connect(filter).connect(g).connect(master!)
  src.start(t, Math.random() * 0.5)
  src.stop(t + opts.dur + 0.02)
}

function blip(c: AudioContext, opts: { at?: number; freq: number; dur: number; gain: number; type?: OscillatorType }) {
  const t = opts.at ?? c.currentTime
  const osc = c.createOscillator()
  osc.type = opts.type ?? 'sine'
  osc.frequency.value = opts.freq
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(opts.gain, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)
  osc.connect(g).connect(master!)
  osc.start(t)
  osc.stop(t + opts.dur + 0.02)
}

function startAmbient(c: AudioContext) {
  if (ambient || prefersReducedMotion()) return
  const out = c.createGain()
  out.gain.value = 0.0001
  out.connect(master!)

  // motor hum
  const hum = c.createOscillator()
  hum.type = 'sawtooth'
  hum.frequency.value = 50
  const humLp = c.createBiquadFilter()
  humLp.type = 'lowpass'
  humLp.frequency.value = 140
  const humGain = c.createGain()
  humGain.gain.value = 0.05
  hum.connect(humLp).connect(humGain).connect(out)

  // 24 fps intermittent: band-passed noise gated by a 24 Hz square LFO
  const clatter = c.createBufferSource()
  clatter.buffer = noise
  clatter.loop = true
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1800
  bp.Q.value = 0.9
  const gate = c.createGain()
  gate.gain.value = 0.012
  const lfo = c.createOscillator()
  lfo.type = 'square'
  lfo.frequency.value = 24
  const depth = c.createGain()
  depth.gain.value = 0.012
  lfo.connect(depth).connect(gate.gain)
  clatter.connect(bp).connect(gate).connect(out)

  hum.start()
  clatter.start()
  lfo.start()
  out.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.5)

  ambient = {
    gain: out,
    stop: () => {
      const t = c.currentTime
      out.gain.cancelScheduledValues(t)
      out.gain.setValueAtTime(out.gain.value, t)
      out.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
      ;[hum, clatter, lfo].forEach((n) => n.stop(t + 0.7))
    },
  }
}

function stopAmbient() {
  ambient?.stop()
  ambient = null
}

export const sound = {
  isOn: () => enabled,

  subscribe(fn: Listener) {
    listeners.add(fn)
    return () => void listeners.delete(fn)
  },

  /** Must be called from a user gesture (click / key press). */
  async setOn(on: boolean) {
    enabled = on
    writePref(on)
    listeners.forEach((l) => l(on))
    if (!on) {
      stopAmbient()
      return
    }
    const c = ensureContext()
    if (!c) return
    if (c.state !== 'running') await c.resume()
    sound.leader()
    startAmbient(c)
  },

  /** Film-leader beep (1 kHz), played when sound is switched on. */
  leader() {
    const c = live()
    if (c) blip(c, { freq: 1000, dur: 0.16, gain: 0.18 })
  },

  /** Dry reel tick; `strength` 0..1 from scroll speed. */
  tick(strength = 0.5) {
    const c = live()
    if (!c || prefersReducedMotion()) return
    noiseBurst(c, { dur: 0.03, gain: 0.05 + strength * 0.12, type: 'highpass', freq: 3200 })
    blip(c, { freq: 2200 + Math.random() * 300, dur: 0.02, gain: 0.02 + strength * 0.03, type: 'triangle' })
  },

  /** Soft hover click. */
  hover() {
    const c = live()
    if (!c) return
    blip(c, { freq: 1500, dur: 0.045, gain: 0.05 })
    noiseBurst(c, { dur: 0.02, gain: 0.03, type: 'bandpass', freq: 4000, q: 2 })
  },

  /** Small click for navigation. */
  click() {
    const c = live()
    if (!c) return
    blip(c, { freq: 900, dur: 0.06, gain: 0.08, type: 'triangle' })
  },

  /** Camera shutter: two mechanical clacks with a short whir between. */
  shutter() {
    const c = live()
    if (!c) return
    const t = c.currentTime
    noiseBurst(c, { at: t, dur: 0.05, gain: 0.35, type: 'bandpass', freq: 2600, q: 1.4 })
    noiseBurst(c, { at: t + 0.02, dur: 0.08, gain: 0.12, type: 'lowpass', freq: 700 })
    noiseBurst(c, { at: t + 0.11, dur: 0.06, gain: 0.28, type: 'bandpass', freq: 1900, q: 1.4 })
  },
}

/**
 * Wires page-level listeners once: resume on first gesture when the visitor
 * opted in earlier, scroll ticks, hover clicks and pausing when the tab hides.
 */
export function initSound() {
  if (typeof window === 'undefined') return () => {}
  const wanted = readPref()
  enabled = false

  const onFirstGesture = (e: Event) => {
    // the toggle handles its own click; resuming here would immediately be undone by it
    if ((e.target as HTMLElement | null)?.closest('[data-sound-toggle]')) return
    if (wanted && !enabled) void sound.setOn(true)
  }
  window.addEventListener('pointerdown', onFirstGesture, { once: true })
  window.addEventListener('keydown', onFirstGesture, { once: true })

  // a tick every ~110px of travel, rate-limited
  let lastY = window.scrollY
  let travelled = 0
  let lastTick = 0
  const onScroll = () => {
    const y = window.scrollY
    const d = Math.abs(y - lastY)
    lastY = y
    travelled += d
    const now = performance.now()
    if (travelled > 110 && now - lastTick > 45) {
      travelled = 0
      lastTick = now
      sound.tick(Math.min(1, d / 60))
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // hover clicks on interactive media (cards, prints, images) — fine pointers only
  let lastHover: Element | null = null
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = (e.target as HTMLElement | null)?.closest('[data-cursor]') ?? null
    if (el && el !== lastHover) sound.hover()
    lastHover = el
  }
  window.addEventListener('pointerover', onOver, { passive: true })

  const onVisibility = () => {
    if (!ctx) return
    if (document.hidden) void ctx.suspend()
    else if (enabled) void ctx.resume()
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.removeEventListener('pointerdown', onFirstGesture)
    window.removeEventListener('keydown', onFirstGesture)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('pointerover', onOver)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

/** Whether the visitor opted in on a previous visit (shown as "will resume"). */
export const soundPreferred = readPref
