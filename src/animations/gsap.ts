import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { BEZIER } from './easing'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

CustomEase.create('reveal', BEZIER.reveal.join(','))
CustomEase.create('cine', BEZIER.cine.join(','))

gsap.defaults({ ease: 'reveal', duration: 1.1 })

export { gsap, ScrollTrigger, SplitText }
