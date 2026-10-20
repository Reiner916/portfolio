import { useLayoutEffect, useRef } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'
import { gsap, lenis, ScrollTrigger } from '../../../lib/motion'
import { BEZEL, SCREEN, SCREEN_CENTER, SetupScene } from './SetupScene'

// Découpage de la séquence (en fraction du scroll de l'intro) :
// [0 → START]           recul : on découvre tout le setup (accessible en remontant)
// [START → START+DIVE]  plongée dans l'écran
// [reste]               on est "dans" l'écran, le fond devient celui du site
const START = 0.28
const DIVE = 0.6
const OUTRO = 1 - START - DIVE

// Le SVG est en "meet" : on convertit la taille de la fenêtre en unités SVG.
function viewportInUnits() {
  const k = Math.min(window.innerWidth / 1600, window.innerHeight / 1000)
  return { W: window.innerWidth / k, H: window.innerHeight / k }
}

function computeScales() {
  const { W, H } = viewportInUnits()
  // Position de départ : l'écran occupe une bonne partie du cadre
  const initial = gsap.utils.clamp(1.2, 3, Math.min((0.74 * W) / BEZEL.w, (0.66 * H) / BEZEL.h))
  // Fin : le trou de l'écran recouvre toute la fenêtre (marge pour les coins arrondis)
  const end = Math.max(W / SCREEN.w, H / SCREEN.h) * 1.25
  return { initial, end }
}

export function IntroSvg() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<SVGGElement>(null)
  const backRef = useRef<SVGGElement>(null)
  const frontRef = useRef<SVGGElement>(null)
  const screenDimRef = useRef<SVGGElement>(null)
  const screenTextRef = useRef<SVGGElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const leafLeftRef = useRef<HTMLDivElement>(null)
  const leafRightRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      let scales = computeScales()
      // Chaque couche SVG a un état (échelle, décalage vertical) animé par GSAP ; render() écrit les transforms.
      // z : 0 = setup entier, 1 = position de départ, 2 = écran traversé. Le zoom est exponentiel pour rester régulier à l'œil.
      const zoom = { z: 0 }
      const back = { s: 1.12 }
      const front = { s: 1, y: 0 }
      const scaleAround = (el: SVGGElement | null, s: number, cx: number, cy: number, dy = 0) =>
        el?.setAttribute('transform', `translate(${cx} ${cy + dy}) scale(${s}) translate(${-cx} ${-cy})`)
      const render = () => {
        const { initial, end } = scales
        const logScale = zoom.z <= 1 ? Math.log(initial) * zoom.z : Math.log(initial) + (Math.log(end) - Math.log(initial)) * (zoom.z - 1)
        scaleAround(worldRef.current, Math.exp(logScale), SCREEN_CENTER.x, SCREEN_CENTER.y)
        scaleAround(backRef.current, back.s, SCREEN_CENTER.x, SCREEN_CENTER.y)
        scaleAround(frontRef.current, front.s, 800, 840, front.y)
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: render,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: () => {
            scales = computeScales()
            render()
          },
        },
      })

      // Zoom principal
      tl.to(zoom, { z: 1, duration: START }, 0)
      tl.to(zoom, { z: 2, duration: DIVE, ease: 'power2.in' }, START)

      // Parallaxe : le mur bouge moins vite que l'écran, les objets du premier plan plus vite
      tl.to(back, { s: 1, duration: START }, 0)
      tl.to(back, { s: 0.82, duration: DIVE, ease: 'power2.in' }, START)
      tl.to(front, { s: 1.6, y: 160, duration: DIVE * 0.55, ease: 'power2.in' }, START)
      tl.to(frontRef.current, { opacity: 0, duration: DIVE * 0.4, ease: 'power2.in' }, START + DIVE * 0.15)

      // Feuillages flous au tout premier plan
      tl.fromTo([leafLeftRef.current, leafRightRef.current], { scale: 0.8, opacity: 0.5 }, { scale: 1, opacity: 1, duration: START }, 0)
      tl.to(leafLeftRef.current, { scale: 2.4, xPercent: -40, yPercent: 30, opacity: 0, duration: DIVE * 0.5, ease: 'power2.in' }, START)
      tl.to(leafRightRef.current, { scale: 2.4, xPercent: 40, yPercent: 30, opacity: 0, duration: DIVE * 0.5, ease: 'power2.in' }, START)

      // Contenu de l'écran : le texte s'efface, le voile disparaît → il ne reste que le fond du site
      tl.to(screenTextRef.current, { opacity: 0, duration: DIVE * 0.3 }, START + 0.02)
      tl.to(screenDimRef.current, { opacity: 0, duration: DIVE * 0.5 }, START)
      tl.to(hintRef.current, { autoAlpha: 0, duration: 0.05 }, START + 0.015)

      tl.to(stageRef.current, { autoAlpha: 0, duration: OUTRO * 0.3 }, START + DIVE)

      // On démarre au milieu de la séquence pour pouvoir remonter (reculer)
      const st = tl.scrollTrigger!
      ScrollTrigger.refresh()
      const startY = st.start + (st.end - st.start) * START
      lenis.resize()
      window.scrollTo(0, startY)
      lenis.scrollTo(startY, { immediate: true, force: true })
      tl.progress(START)
      render()
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="intro" className="relative h-[450vh]" aria-label={t('intro.name')}>
      <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <SetupScene
          refs={{ world: worldRef, back: backRef, front: frontRef, screenDim: screenDimRef, screenText: screenTextRef }}
        />

        {/* Premier plan flou (profondeur, comme les nuages de JeskoJets) */}
        <div ref={leafLeftRef} aria-hidden className="pointer-events-none absolute -bottom-16 -left-20 w-[38vmin] origin-bottom-left blur-[6px]">
          <Leaves />
        </div>
        <div ref={leafRightRef} aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 w-[30vmin] origin-bottom-right -scale-x-100 blur-[8px]">
          <Leaves />
        </div>

        <div ref={hintRef} className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-center">
          <span className="relative flex h-9 w-6 justify-center rounded-full border border-fg/40 pt-2" aria-hidden>
            <span className="h-2 w-1 rounded-full bg-accent" style={{ animation: 'scroll-dot 1.6s ease-in-out infinite' }} />
          </span>
          <span className="font-mono text-sm tracking-wide text-fg">{t('intro.hintDown')}</span>
          <span className="font-mono text-xs text-muted">↑ {t('intro.hintUp')}</span>
        </div>
      </div>
    </section>
  )
}

function Leaves() {
  return (
    <svg viewBox="0 0 300 300" className="h-auto w-full">
      <path d="M40 300 C 20 200 60 110 150 60 C 140 150 110 230 40 300 Z" style={{ fill: 'color-mix(in oklab, var(--c-accent) 30%, black)' }} />
      <path d="M0 290 C 30 210 100 170 200 170 C 150 230 80 270 0 290 Z" style={{ fill: 'color-mix(in oklab, var(--c-accent) 45%, black)' }} />
      <path d="M90 300 C 120 230 200 200 290 220 C 220 270 160 295 90 300 Z" style={{ fill: 'color-mix(in oklab, var(--c-accent) 22%, black)' }} />
    </svg>
  )
}
