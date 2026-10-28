import { img } from './images'
import type { Organization } from './types'

export const organizationsIntro = {
  label: 'ORGANIZATIONS',
  heading: 'Where the work happens',
  lead: 'Five student organizations — three of them documented in depth below.',
}

/** Ordered left → right exactly as fanned in the deck. */
export const organizations: Organization[] = [
  {
    id: 'starlight',
    name: 'Starlight UMN',
    period: '2024',
    cover: img('org-starlight', 'Starlight UMN 2024 member card with a golden star frame'),
  },
  {
    id: 'imkom',
    name: 'I’M KOM',
    generation: 'Gen XV',
    period: '2024/2025',
    cover: img('org-imkom', 'I’M KOM KOMINFO division member card for Josyca Nauli on an orange background'),
    caseStudy: {
      role: 'Creative Media Division',
      division: 'KOMINFO · Himpunan Ilmu Komunikasi',
      summary:
        "As part of the Creative Media Division (KOMINFO) at Himpunan Ilmu Komunikasi (I'M KOM) Generation XV, I led member profile photo sessions, crafted visual layout designs, and documented the organization's activities from start to finish.",
      memberCard: { name: 'Josyca Nauli', label: 'Anggota Divisi Kominfo · Digital Journalism 2024' },
      designsTitle: 'Design',
      designs: [
        img('imkom-design-1', '“Get to Know” member feature post for Rahas Ine Kusuma, SC 24'),
        img('imkom-design-2', '“Let’s See Our Plans!” December 2025 calendar post with the leopard mascot'),
      ],
      extra: {
        title: 'Kom’s Emoji',
        image: img('imkom-emoji', 'Kom’s Emoji sticker set: the I’M KOM leopard mascot in eight expressions'),
      },
      documentation: [
        { ...img('imkom-doc-1', 'I’M KOM Gen XV members group photo'), caption: 'I’M KOM Gen XV' },
        { ...img('imkom-doc-2', 'Members making heart gestures at the inauguration'), caption: 'Inauguration' },
        { ...img('imkom-doc-3', 'Josyca filming behind the scenes with a camera rig'), caption: 'BTS Video Profile I’m Kom Gen XV' },
        { ...img('imkom-doc-4', 'Members posing together at the farewell'), caption: 'Farewell' },
        { ...img('imkom-doc-5', 'Setting up lighting for a photobooth'), caption: 'Set Up Lighting Photobooth Birthday Bast I’m Kom' },
        { ...img('imkom-doc-6', 'KOMINFO division members posing in a lecture hall'), caption: 'KOMINFO I’m Kom Gen XV' },
      ],
      links: [],
    },
  },
  {
    id: 'bem',
    name: 'BEM UMN',
    generation: 'Gen XVI',
    period: '2025/2026',
    cover: img('org-bem', 'BEM UMN Gen XVI “PR Internal 2” member card of Josyca Nauli P. seated in a cinema'),
    caseStudy: {
      role: 'Creative Media Division',
      division: 'Internal Public Relations · Student Executive Board',
      summary:
        "As a member of the Creative Media Division (Internal Public Relations) of Student Executive Board (BEM) Gen XVI UMN, I was responsible for designing visual content, overseeing the production of the BEM profile video, and documenting the organization's various activities and events.",
      memberCard: { name: 'Josyca Nauli P.', label: "PR Internal 2 · Jurnalistik '24" },
      designsTitle: 'Design',
      designs: [
        img('bem-design-1', '“Roots & Renaissance” environmental feature post'),
        img('bem-design-2', 'Photo-collage post pinned like a mood board'),
        img('bem-design-3', '“Open Recruitment BEM Gen XVII” poster with a torn-paper reveal'),
        img('bem-design-4', 'Comparative study recap post with a crowd photo'),
      ],
      documentation: [
        { ...img('bem-doc-1', 'Inauguration ceremony group photo on stage'), caption: 'Inauguration of BEM GEN XVI' },
        { ...img('bem-doc-2', 'Student Executive Board members group photo'), caption: 'UMN Student Executive Board Member, Gen XVI' },
        { ...img('bem-doc-3', 'Night group photo at the leadership training'), caption: 'Student Organization Leadership Training' },
        { ...img('bem-doc-4', 'Public Relations team posing playfully'), caption: 'Public Relations BEM UMN Gen XVI' },
        { ...img('bem-doc-5', 'Delegates seated in an auditorium behind a Tour de Campus banner'), caption: 'Comparative Study with Universitas Prasetiya Mulya' },
        { ...img('bem-doc-6', 'Frame from the BEM UMN Gen XVI profile video in a forest'), caption: 'Served as director and editor for the UMN Student Executive Board Gen XVI profile video.' },
      ],
      links: [{ label: 'Watch the profile video', href: null, todo: 'BEM UMN Gen XVI profile video URL' }],
    },
  },
  {
    id: 'eco',
    name: 'UMN ECO',
    period: '2025',
    cover: img('org-eco', 'UMN ECO 2025 member card of Josyca Nauli P, JAGAT, making a heart gesture'),
    caseStudy: {
      role: 'Secretary II',
      division: 'Earth Caring Operation',
      summary:
        "In my role as Secretary II of UMN ECO, I am responsible for assisting with the organization's administration, including taking meeting minutes, archiving event documents, and ensuring effective and structured coordination among core committee members.",
      memberCard: { name: 'Josyca Nauli P', label: 'JAGAT' },
      designsTitle: 'Administration',
      designs: [],
      extra: {
        title: 'One of the administrative documents for UMN ECO 2025',
        image: img('eco-lpj', 'Cover of the accountability report (Laporan Pertanggungjawaban) for Rite of Nanea'),
      },
      documentation: [
        { ...img('eco-doc-1', 'Committee group photo at the Maimiti Island exhibition booth'), caption: 'Maimiti Island UMN ECO 2025 exhibition' },
        { ...img('eco-doc-2', 'Members making heart gestures at the first plenary meeting'), caption: 'UMN ECO 2025 First Plenary Meeting' },
        { ...img('eco-doc-3', 'Two committee members posing with documents'), caption: '' },
        { ...img('eco-doc-4', 'Members seated together at the fifth plenary meeting'), caption: 'UMN ECO 2025 Fifth Plenary Meeting' },
        { ...img('eco-doc-5', 'Full auditorium at the farewell event'), caption: 'UMN ECO 2025 Farewell Event' },
        { ...img('eco-doc-6', 'Organizing committee posing behind large UMN ECO letters'), caption: 'The Organizing Committee for the Rite of Nanea event' },
      ],
      links: [],
    },
  },
  {
    id: 'flagship',
    name: 'Flagship',
    generation: '4.0',
    period: '2024',
    cover: img('org-flagship', 'Flagship 4.0 2024 card with hand-lettered title'),
  },
]

/** Case-study order follows the deck (BEM → I'M KOM → UMN ECO). */
export const caseStudyOrder = ['bem', 'imkom', 'eco'] as const
