import { img } from './images'
import type { Project } from './types'

export const projectsIntro = {
  label: 'PROJECT',
  heading: 'Stories, produced',
  lead: 'Three productions — a writing collaboration, a media competition and a reportage film.',
}

export const projects: Project[] = [
  {
    id: 'pulitzer',
    kicker: 'AI-Related Writing Project with Pulitzer Center',
    year: '2025',
    title: 'Deepfake Nudification: An Irony of Technological Advancement',
    roles: ['Producer', 'Photographer'],
    summary:
      'I was part of Group 1, which examined the topic "Deepfake Nudification: An Irony of Technological Advancement." Within the team, I took on the roles of Producer and Photographer, contributing to both the production process and visual documentation of the project.',
    media: [
      img('pulitzer-article', 'The Junction article page: Deepfake Nudification — An Irony of Technological Advancement'),
      img('pulitzer-illustration', 'Photo illustration of a person at a monitor in the dark. Credit: Josyca P'),
      img('pulitzer-interview-1', 'Interview coverage with Damar Juniarto, member of KTP2JB'),
      img('pulitzer-interview-2', 'Interview coverage at Komnas Perempuan with Chatarina Pancer Istiyani'),
    ],
    facts: [
      { label: 'Published on', value: 'The Junction — university student journalism from Australia, NZ and the Pacific' },
      { label: 'Interviews', value: 'Damar Juniarto · Chatarina Pancer Istiyani' },
      { label: 'Photo illustration', value: 'Credit: Josyca P' },
    ],
    links: [{ label: 'Read the article', href: null, todo: 'The Junction article URL' }],
  },
  {
    id: 'idn',
    kicker: 'COMMFEST UMN × IDN Times',
    year: '2025',
    title: 'A mini media production competition',
    subtitle: 'Organized by COMMFEST UMN in collaboration with IDN Times.',
    roles: ['Producer', 'Director'],
    summary:
      'I served as Producer and Director in a competition hosted by COMMFEST UMN in collaboration with IDN Times, overseeing team-committee coordination and steering the project toward its goals.',
    media: [
      img('idn-article', 'IDN Times opinion article: Indonesia Summit 2025 — Gaungkan Perubahan Lewat Forum Lintas Generasi'),
      img('idn-expo-1', 'Exhibited photo series on a gallery wall'),
      img('idn-expo-2', 'Visitors at the photo exhibition'),
    ],
    facts: [
      { label: 'Published on', value: 'IDN Times — “[OPINI] Indonesia Summit 2025: Gaungkan Perubahan Lewat Forum Lintas Generasi”' },
      { label: 'Exhibited', value: 'Photo series on display' },
    ],
    links: [{ label: 'Read on IDN Times', href: null, todo: 'IDN Times article URL' }],
  },
  {
    id: 'keruh',
    kicker: 'Final project · Interviewing and Reporting course',
    year: '2025',
    title: 'Menembus Keruh: Rumah Air dan Harapan Warga',
    roles: ['Director', 'Second Editor'],
    summary:
      'As the final project for the Interviewing and Reporting course, my production team and I produced a piece highlighting the clean water crisis in Muara Angke. I served as Director and Second Editor, overseeing the creative direction of the production while contributing to the post-production editing process.',
    media: [
      img('keruh-still-1', 'Rusty cart loaded with plastic water jerrycans in Muara Angke'),
      img('keruh-credits', 'Closing credits: Menembus Keruh — Rumah Air dan Harapan Warga'),
      img('keruh-still-2', 'Interviewee standing beside water filtration pipes'),
    ],
    facts: [
      { label: 'Topic', value: 'Clean water crisis in Muara Angke' },
      { label: 'Directed by', value: 'Josyca Nauli P. · Gabri Perboire R. S.' },
      { label: 'Produced by', value: 'Jemima Anasya R.' },
      { label: 'Written by', value: 'Belva Putri Paramitha' },
    ],
    links: [{ label: 'Watch the film', href: null, todo: 'Menembus Keruh video URL' }],
  },
]
