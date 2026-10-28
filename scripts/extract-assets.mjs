/**
 * Crops web assets out of the flattened Canva deck.
 *
 * The PDF has no separate image objects — every page is one 3840×2340 bitmap —
 * so assets are cut from page renders. Extract them first:
 *   pdfimages -png "UPDATED PORTOFOLIO_JOSYCA N..pdf" .cache/deck/page
 *
 * Coordinates below are in a 1600-wide reference frame (what the pages were
 * reviewed at) and scaled to the source resolution. `angle` derotates tilted
 * polaroids/cards: it is the clockwise tilt as it appears on the page.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = '.cache/deck'
const OUT = 'public/assets/img'
const K = 3840 / 1600

const page = (n) => path.join(SRC, `page-${String(n - 1).padStart(3, '0')}.png`)

/** [name, page, x0, y0, x1, y1, maxWidth] or { name, page, cx, cy, w, h, angle, maxWidth } */
const crops = [
  // hero + about
  ['hero-cinema', 1, 520, 140, 1120, 485, 1600],
  ['about-portrait', 2, 915, 210, 1450, 855, 1100],

  // organization cover cards
  ['org-bem', 5, 632, 352, 968, 775, 800],
  ['org-imkom', 6, 632, 355, 967, 770, 800],
  ['org-eco', 7, 636, 355, 964, 765, 800],
  { name: 'org-starlight', page: 4, cx: 262, cy: 845, w: 250, h: 250, angle: -33, maxWidth: 600 },
  { name: 'org-flagship', page: 4, cx: 1320, cy: 845, w: 250, h: 250, angle: 33, maxWidth: 600 },

  // BEM — designs
  ['bem-design-1', 5, 85, 210, 314, 496, 640],
  ['bem-design-2', 5, 334, 210, 564, 496, 640],
  ['bem-design-3', 5, 85, 522, 314, 807, 640],
  ['bem-design-4', 5, 334, 522, 564, 807, 640],
  // BEM — documentation
  ['bem-doc-1', 5, 1276, 122, 1513, 305, 900],
  { name: 'bem-doc-2', page: 5, cx: 1150, cy: 280, w: 196, h: 116, angle: 10.5, maxWidth: 900 },
  ['bem-doc-3', 5, 1335, 398, 1520, 598, 900],
  { name: 'bem-doc-4', page: 5, cx: 1172, cy: 482, w: 224, h: 136, angle: -15, maxWidth: 900 },
  { name: 'bem-doc-5', page: 5, cx: 1166, cy: 678, w: 180, h: 76, angle: 10, maxWidth: 900 },
  ['bem-doc-6', 5, 1280, 678, 1517, 872, 900],

  // I'M KOM — designs
  ['imkom-design-1', 6, 74, 232, 303, 517, 640],
  ['imkom-design-2', 6, 327, 232, 555, 517, 640],
  ['imkom-emoji', 6, 120, 535, 500, 830, 900],
  // I'M KOM — documentation
  ['imkom-doc-1', 6, 1276, 122, 1513, 305, 900],
  { name: 'imkom-doc-2', page: 6, cx: 1150, cy: 280, w: 196, h: 116, angle: 10.5, maxWidth: 900 },
  ['imkom-doc-3', 6, 1335, 398, 1520, 598, 900],
  { name: 'imkom-doc-4', page: 6, cx: 1172, cy: 485, w: 224, h: 136, angle: -15, maxWidth: 900 },
  { name: 'imkom-doc-5', page: 6, cx: 1168, cy: 672, w: 180, h: 76, angle: 10, maxWidth: 900 },
  ['imkom-doc-6', 6, 1280, 678, 1517, 872, 900],

  // UMN ECO — admin document + documentation
  ['eco-lpj', 7, 130, 290, 468, 740, 700],
  ['eco-doc-1', 7, 1276, 122, 1513, 305, 900],
  { name: 'eco-doc-2', page: 7, cx: 1150, cy: 280, w: 196, h: 116, angle: 10.5, maxWidth: 900 },
  ['eco-doc-3', 7, 1335, 398, 1520, 598, 900],
  { name: 'eco-doc-4', page: 7, cx: 1172, cy: 485, w: 224, h: 136, angle: -15, maxWidth: 900 },
  { name: 'eco-doc-5', page: 7, cx: 1168, cy: 672, w: 180, h: 76, angle: 10, maxWidth: 900 },
  ['eco-doc-6', 7, 1280, 678, 1517, 872, 900],

  // Project — Pulitzer / The Junction
  ['pulitzer-article', 9, 228, 333, 603, 540, 1000],
  ['pulitzer-illustration', 9, 248, 566, 588, 756, 1000],
  ['pulitzer-interview-1', 9, 816, 256, 1150, 788, 900],
  ['pulitzer-interview-2', 9, 1171, 256, 1492, 788, 900],
  // Project — COMMFEST × IDN Times
  ['idn-article', 10, 208, 343, 619, 797, 1000],
  ['idn-expo-1', 10, 881, 378, 1191, 727, 900],
  ['idn-expo-2', 10, 1215, 376, 1418, 731, 700],
  // Project — Menembus Keruh
  ['keruh-credits', 11, 0, 334, 496, 791, 1100],
  ['keruh-still-1', 11, 528, 383, 1144, 727, 1400],
  ['keruh-still-2', 11, 1177, 320, 1600, 790, 1000],
]

const meta = new Map()
async function src(n) {
  if (!meta.has(n)) meta.set(n, await sharp(page(n)).metadata())
  return meta.get(n)
}

async function cropRect(n, x0, y0, x1, y1) {
  const { width, height } = await src(n)
  const left = Math.max(0, Math.round(x0 * K))
  const top = Math.max(0, Math.round(y0 * K))
  return sharp(page(n)).extract({
    left,
    top,
    width: Math.min(width - left, Math.round((x1 - x0) * K)),
    height: Math.min(height - top, Math.round((y1 - y0) * K)),
  })
}

async function cropRotated({ page: n, cx, cy, w, h, angle }) {
  const { width, height } = await src(n)
  // Take a square around the centre big enough to hold the rotated rect, clamped to the page.
  const half = Math.ceil((Math.hypot(w, h) / 2 + 4) * K)
  const ccx = Math.round(cx * K)
  const ccy = Math.round(cy * K)
  const left = Math.max(0, ccx - half)
  const top = Math.max(0, ccy - half)
  const right = Math.min(width, ccx + half)
  const bottom = Math.min(height, ccy + half)
  const square = await sharp(page(n))
    .extract({ left, top, width: right - left, height: bottom - top })
    .rotate(-angle, { background: '#2B0E14' })
    .toBuffer({ resolveWithObject: true })
  // The rotated canvas keeps the square's centre in its centre; account for page clamping.
  const offX = ccx - (left + right) / 2
  const offY = ccy - (top + bottom) / 2
  const rad = (-angle * Math.PI) / 180
  const rx = offX * Math.cos(rad) - offY * Math.sin(rad)
  const ry = offX * Math.sin(rad) + offY * Math.cos(rad)
  const W = Math.round(w * K)
  const H = Math.round(h * K)
  const L = Math.max(0, Math.round(square.info.width / 2 + rx - W / 2))
  const T = Math.max(0, Math.round(square.info.height / 2 + ry - H / 2))
  return sharp(square.data).extract({
    left: L,
    top: T,
    width: Math.min(W, square.info.width - L),
    height: Math.min(H, square.info.height - T),
  })
}

await mkdir(OUT, { recursive: true })
const manifest = {}
for (const c of crops) {
  const spec = Array.isArray(c)
    ? { name: c[0], page: c[1], rect: c.slice(2, 6), maxWidth: c[6] }
    : c
  const img = spec.rect ? await cropRect(spec.page, ...spec.rect) : await cropRotated(spec)
  const buf = await img.png().toBuffer()
  const out = await sharp(buf)
    .resize({ width: spec.maxWidth, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(path.join(OUT, `${spec.name}.webp`))
  manifest[spec.name] = [out.width, out.height]
  console.log(`${spec.name.padEnd(24)} ${out.width}×${out.height}  ${(out.size / 1024).toFixed(0)} KB`)
}

// Open Graph image (1200×630) from the deck cover.
await sharp(page(1)).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toFile('public/og-image.jpg')

console.log('\nDimensions (for src/data/images.ts):')
console.log(JSON.stringify(manifest))
