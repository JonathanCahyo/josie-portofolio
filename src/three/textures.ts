import * as THREE from 'three'

export const PALETTE = {
  bg: '#2B0E14',
  surface: '#3B1E24',
  primary: '#571822',
  accent: '#6D1724',
  cream: '#F0E6DC',
  fg: '#FAFAFA',
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return { c, ctx }
}

function toTexture(c: HTMLCanvasElement, anisotropy = 4) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = anisotropy
  t.needsUpdate = true
  return t
}

/** Reel face: cream disc with the deck's wine groove ring and a subtle radial sheen. */
export function reelFaceTexture(size = 1024) {
  const { c, ctx } = canvas(size, size)
  const r = size / 2
  ctx.fillStyle = PALETTE.cream
  ctx.fillRect(0, 0, size, size)

  const sheen = ctx.createRadialGradient(r * 0.7, r * 0.6, 0, r, r, r)
  sheen.addColorStop(0, 'rgba(255,255,255,0.35)')
  sheen.addColorStop(1, 'rgba(180,150,140,0.18)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, size, size)

  // groove ring (between the label band and the spoke holes)
  ctx.strokeStyle = PALETTE.surface
  ctx.lineWidth = size * 0.045
  ctx.beginPath()
  ctx.arc(r, r, r * 0.64, 0, Math.PI * 2)
  ctx.stroke()

  // fine lathe rings
  ctx.strokeStyle = 'rgba(87,24,34,0.12)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.arc(r, r, r * (0.7 + i * 0.033), 0, Math.PI * 2)
    ctx.stroke()
  }
  return toTexture(c, 8)
}

/**
 * Text set along the reel's outer band. `full` repeats the label around the
 * whole circle (hero); otherwise it is centred on the top arc like the deck.
 */
export function ringLabelTexture(label: string, full: boolean, size = 1024) {
  const { c, ctx } = canvas(size, size)
  const r = size / 2
  const radius = r * 0.83
  ctx.translate(r, r)
  ctx.fillStyle = PALETTE.accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fontPx = Math.round(size * (full ? 0.06 : 0.088))
  ctx.font = `700 ${fontPx}px Tinos, 'Times New Roman', serif`

  const text = full ? `${label}  ✦  ${label}  ✦  ` : label
  const chars = [...text]
  const tracking = fontPx * (full ? 0.12 : 0.5)
  const widths = chars.map((ch) => ctx.measureText(ch).width + tracking)
  const total = widths.reduce((a, b) => a + b, 0)
  // angle per pixel along the arc; 0 rad = 12 o'clock, clockwise (canvas y is down)
  const k = full ? (Math.PI * 2) / total : 1 / radius
  let a = full ? 0 : -(total * k) / 2

  chars.forEach((ch, i) => {
    const half = (widths[i] * k) / 2
    a += half
    ctx.save()
    ctx.rotate(a)
    ctx.translate(0, -radius)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    a += half
  })
  return toTexture(c, 8)
}

/** "GRAPHIC DESIGNER" wrapped on the statement cylinder. */
export function statementTexture(text: string) {
  const w = 4096
  const h = 900
  const { c, ctx } = canvas(w, h)
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#F6EEE6')
  grad.addColorStop(0.65, PALETTE.cream)
  grad.addColorStop(1, '#C9A9A6')
  ctx.fillStyle = grad
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let px = 820
  ctx.font = `600 ${px}px 'Oswald Variable', Oswald, 'Arial Narrow', sans-serif`
  // fit to width with a little breathing room
  const target = w * 0.94
  const measured = ctx.measureText(text).width
  if (measured > target) {
    px = Math.floor((px * target) / measured)
    ctx.font = `600 ${px}px 'Oswald Variable', Oswald, 'Arial Narrow', sans-serif`
  }
  ctx.save()
  // Oswald is already condensed; stretch vertically for the deck's tall letters
  ctx.translate(w / 2, h / 2)
  ctx.scale(1, h / (px * 0.95))
  ctx.fillText(text, 0, 0)
  ctx.restore()
  return toTexture(c, 8)
}

/** Tool tile face: monogram (periodic-table style) + tool name. */
export function tileTexture(mono: string, name: string, dark: boolean) {
  const s = 512
  const { c, ctx } = canvas(s, s)
  const fg = dark ? PALETTE.cream : PALETTE.accent
  ctx.fillStyle = fg
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `700 230px Tinos, 'Times New Roman', serif`
  ctx.fillText(mono, 56, 300)
  ctx.font = `400 46px Carlito, Calibri, sans-serif`
  ctx.globalAlpha = 0.9
  ctx.fillText(name, 60, 430)
  ctx.globalAlpha = 0.5
  ctx.fillRect(60, 340, 110, 4)
  return toTexture(c)
}
