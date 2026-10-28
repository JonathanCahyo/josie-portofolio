import type { MaybeLink } from './types'

export const site = {
  brand: { script: "josie's", word: 'PORTOFOLIO' },
  name: 'Josyca Nauli',
  fullName: 'Josyca Nauli P.',
  role: 'Graphic Designer',
  study: 'Digital Journalism',
  university: 'Universitas Multimedia Nusantara',
  universityShort: 'UMN',
  cohort: "Jurnalistik '24",
}

/** Nav labels match the deck's pill navigation. */
export const nav = [
  { id: 'profile', label: 'Profile' },
  { id: 'about', label: 'About' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
] as const

export type NavId = (typeof nav)[number]['id']

export const contact = {
  heading: 'Thank you for taking the time to explore my journey',
  tagline: "I'm always open to new collaborations and conversations.",
  instagram: { handle: 'joorbc', href: 'https://www.instagram.com/joorbc/' },
  email: 'josycanauli@gmail.com',
  /** Not in the deck — owner to supply. */
  more: [
    { label: 'LinkedIn', href: null, todo: 'LinkedIn profile URL' },
    { label: 'Download CV', href: null, todo: 'CV PDF (place in public/ and link here)' },
  ] satisfies MaybeLink[],
}
