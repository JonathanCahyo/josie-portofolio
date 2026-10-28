import { img } from './images'
import type { Rich } from './types'

export const about = {
  greeting: 'Hi, I’m Josyca Nauli',
  portrait: img('about-portrait', 'Portrait of Josyca Nauli wearing glasses and a dark coat'),
  paragraphs: [
    [
      'I am a ',
      { b: 'graphic designer,' },
      ' currently in my fifth semester as a student in ',
      { b: 'Digital Journalism' },
      ' Department at ',
      { b: 'Universitas Multimedia Nusantara' },
      '.',
    ],
    [
      'I have a strong interest in multimedia production, a skill set I have honed through various journalistic projects during my studies. One of my proudest achievements is the opportunity to participate in a journalism collaboration program with the ',
      { b: 'Pulitzer Center' },
      ', where I served as a producer, helping to publish impactful stories on the latest technology trends.',
    ],
    [
      'I have further cultivated my interest in ',
      { b: 'creative media' },
      ' through active participation in various student organizations, gaining extensive, comprehensive experience in the field of media production.',
    ],
  ] satisfies Rich[],
  facts: [
    { label: 'Role', value: 'Graphic Designer' },
    { label: 'Study', value: 'Digital Journalism, UMN' },
    { label: 'Semester', value: 'Fifth' },
    { label: 'Highlight', value: 'Pulitzer Center collaboration' },
  ],
}

/** Tools shown floating around her in the deck's "GRAPHIC DESIGNER" slide. */
export const toolkit = {
  statement: 'GRAPHIC DESIGNER',
  tools: [
    { mono: 'Fi', name: 'Figma' },
    { mono: 'Ca', name: 'Canva' },
    { mono: 'Pi', name: 'Pinterest' },
    { mono: 'Cc', name: 'CapCut' },
    { mono: 'Dr', name: 'DaVinci Resolve' },
    { mono: 'Ae', name: 'After Effects' },
  ],
}
