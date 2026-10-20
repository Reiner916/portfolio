import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { reducedMotion } from './motionPreference'

gsap.registerPlugin(ScrollTrigger, SplitText)

export const prefersReducedMotion = reducedMotion

// Mêmes réglages que JeskoJets et Truus : durée 1.2 s, courbe "expo out", pas de lissage au tactile.
export const lenis = new Lenis({
  autoRaf: false,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !prefersReducedMotion,
  syncTouch: false,
  touchMultiplier: 1.5, // valeur Truus
})

// Lenis tourne sur le ticker GSAP pour que ScrollTrigger et le scroll restent synchronisés.
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// Les polices changent la hauteur des textes : on recalcule les positions des animations une fois chargées
document.fonts.ready.then(() => ScrollTrigger.refresh())
// Idem une fois toutes les images chargées
window.addEventListener('load', () => ScrollTrigger.refresh())

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

export { gsap, ScrollTrigger, SplitText }

// Accès depuis la console en développement (tests)
if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __gsap: gsap, __SplitText: SplitText })
