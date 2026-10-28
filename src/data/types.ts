export type Img = {
  /** Path under public/, without leading slash — resolved with asset() */
  src: string
  alt: string
  w: number
  h: number
}

/**
 * A link that may not exist yet. `href: null` renders as a clearly marked
 * "coming soon" state; `todo` says what the owner still needs to supply.
 */
export type MaybeLink = {
  label: string
  href: string | null
  todo?: string
}

/** Rich text as segments so emphasis stays in data, not markup. */
export type Rich = Array<string | { b: string }>

export type Polaroid = Img & { caption: string }

export type Organization = {
  id: string
  name: string
  generation?: string
  period: string
  /** Cover shown in the fanned card deck */
  cover: Img
  /** Present only for organizations with a full case study in the deck */
  caseStudy?: CaseStudy
}

export type CaseStudy = {
  role: string
  division: string
  summary: string
  /** Name + label printed on the member card in the deck */
  memberCard: { name: string; label: string }
  designsTitle: string
  designs: Img[]
  extra?: { title: string; image: Img }
  documentation: Polaroid[]
  links: MaybeLink[]
}

export type Project = {
  id: string
  kicker: string
  year: string
  title: string
  subtitle?: string
  roles: string[]
  summary: string
  media: Img[]
  facts: Array<{ label: string; value: string }>
  links: MaybeLink[]
}
