import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Mêmes réglages que la référence JeskoJets : durée 1.2 s, courbe "expo out", pas de lissage au tactile.
export const lenis = new Lenis({
  autoRaf: false,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !prefersReducedMotion,
  syncTouch: false,
})

// Lenis tourne sur le ticker GSAP pour que ScrollTrigger et le scroll restent synchronisés.
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// Les polices changent la hauteur des textes : on recalcule les positions des animations une fois chargées
document.fonts.ready.then(() => ScrollTrigger.refresh())

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

export { gsap, ScrollTrigger }

// Accès depuis la console en développement (tests)
if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis })
