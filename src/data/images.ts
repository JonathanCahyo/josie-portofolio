import type { Img } from './types'

/** Intrinsic sizes of the crops in public/assets/img (from scripts/extract-assets.mjs). */
const sizes = {
  'hero-cinema': [1440, 828],
  'about-portrait': [1100, 1326],
  'org-bem': [800, 1007],
  'org-imkom': [800, 991],
  'org-eco': [787, 984],
  'org-starlight': [600, 600],
  'org-flagship': [600, 600],
  'bem-design-1': [550, 686],
  'bem-design-2': [552, 686],
  'bem-design-3': [550, 684],
  'bem-design-4': [552, 684],
  'bem-doc-1': [569, 439],
  'bem-doc-2': [470, 278],
  'bem-doc-3': [444, 480],
  'bem-doc-4': [538, 326],
  'bem-doc-5': [432, 182],
  'bem-doc-6': [569, 466],
  'imkom-design-1': [550, 684],
  'imkom-design-2': [547, 684],
  'imkom-emoji': [900, 699],
  'imkom-doc-1': [569, 439],
  'imkom-doc-2': [470, 278],
  'imkom-doc-3': [444, 480],
  'imkom-doc-4': [538, 326],
  'imkom-doc-5': [432, 182],
  'imkom-doc-6': [569, 466],
  'eco-lpj': [700, 932],
  'eco-doc-1': [569, 439],
  'eco-doc-2': [470, 278],
  'eco-doc-3': [444, 480],
  'eco-doc-4': [538, 326],
  'eco-doc-5': [432, 182],
  'eco-doc-6': [569, 466],
  'pulitzer-article': [900, 497],
  'pulitzer-illustration': [816, 456],
  'pulitzer-interview-1': [802, 1277],
  'pulitzer-interview-2': [770, 1277],
  'idn-article': [986, 1090],
  'idn-expo-1': [744, 838],
  'idn-expo-2': [487, 852],
  'keruh-credits': [1100, 1014],
  'keruh-still-1': [1400, 782],
  'keruh-still-2': [1000, 1111],
} as const

export type ImageKey = keyof typeof sizes

export function img(key: ImageKey, alt: string): Img {
  const [w, h] = sizes[key]
  return { src: `assets/img/${key}.webp`, alt, w, h }
}
