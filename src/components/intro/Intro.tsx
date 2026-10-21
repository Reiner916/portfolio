import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { markSceneReady, onIntroStart, sceneReady } from '../../lib/loading'
import { gsap, lenis, ScrollTrigger } from '../../lib/motion'
import { isLite, onLiteChange } from '../../lib/quality'

const IntroCanvas = lazy(() => import('./IntroCanvas'))

// Distances de scroll, en hauteurs d'écran :
// BACK_VH pour reculer (au-dessus du point de départ), DIVE_VH pour la plongée (même valeur que la référence : +=250%).
const BACK_VH = 1
const DIVE_VH = 2.5
const BACK = BACK_VH / (BACK_VH + DIVE_VH)

export function Intro() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const overlay = useRef(1)
  const [active, setActive] = useState(true)
  // Mode léger : pas de 3D, l'image de la scène zoome au scroll (2.5D). Hors mode léger, cette même image
  // s'affiche sous la 3D le temps qu'elle se prépare, puis disparaît.
  const [lite, setLite] = useState(isLite)
  const [sceneShown, setSceneShown] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  useEffect(() => onLiteChange(setLite), [])
  useEffect(() => {
    let alive = true
    sceneReady.then(() => alive && !isLite() && setSceneShown(true))
    return () => {
      alive = false
    }
  }, [])

  useLayoutEffect(() => {
    let unsubscribe = () => {}
    const ctx = gsap.context(() => {
      const state = { p: 0 }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // même lissage que la référence
        },
      })
      tl.to(
        state,
        {
          p: 1,
          duration: 1,
          onUpdate: () => {
            progress.current = state.p
            // On coupe le rendu 3D une fois l'écran traversé
            setActive(state.p < 0.999)
          },
        },
        0,
      )
      // Image de la scène : plongée en power2.in comme la caméra, fondu à la fin
      // (l'image ne peut pas "reculer" sans montrer ses bords : en haut de page, simple léger zoom avant)
      tl.fromTo(posterRef.current, { scale: 1 }, { scale: 1.08, duration: BACK }, 0)
      tl.to(posterRef.current, { scale: 3.6, ease: 'power2.in', duration: 1 - BACK }, BACK)
      tl.to(posterRef.current, { opacity: 0, duration: 0.1 }, 0.86)
      tl.to(hintRef.current, { autoAlpha: 0, duration: 0.04 }, BACK + 0.01)
      tl.to(canvasWrapRef.current, { autoAlpha: 0, duration: 0.05 }, 0.95)

      // Quand le preloader se retire, on saute au point "devant l'écran" (on peut ensuite remonter pour reculer).
      // Le scrub fait arriver la caméra en douceur depuis la vue large.
      const st = tl.scrollTrigger!
      ScrollTrigger.refresh()
      unsubscribe = onIntroStart(() => {
        const startY = st.start + (st.end - st.start) * BACK
        lenis.resize()
        lenis.scrollTo(startY, { immediate: true, force: true })
      })
    }, sectionRef)
    return () => {
      unsubscribe()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative"
      style={{ height: `${(BACK_VH + DIVE_VH + 1) * 100}svh` }}
      aria-label={t('intro.name')}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div ref={canvasWrapRef} className="absolute inset-0">
          <div className={`absolute inset-0 ${sceneShown && !lite ? 'invisible' : ''}`} aria-hidden>
            <div ref={posterRef} className="absolute inset-0 will-change-transform">
              <picture>
                <source media="(max-aspect-ratio: 1/1)" srcSet="/intro/poster-mobile.webp" />
                <img
                  src="/intro/poster-desktop.webp"
                  alt=""
                  fetchPriority="high"
                  onLoad={() => isLite() && markSceneReady()}
                  className="size-full object-cover"
                />
              </picture>
            </div>
          </div>
          {!lite && (
            <Suspense fallback={null}>
              <IntroCanvas active={active} progress={progress} overlay={overlay} back={BACK} />
            </Suspense>
          )}
        </div>

        {/* Indication de scroll : pastille bien visible en bas, au-dessus du décor */}
        <div ref={hintRef} className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-5 sm:bottom-10">
          <div className="flex items-center gap-4 rounded-2xl border border-accent/40 bg-bg/75 py-3 pr-6 pl-4 shadow-[0_0_40px_-10px_var(--c-accent)] backdrop-blur-md">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-accent text-bg" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" style={{ animationDuration: '2s' }} />
              <svg viewBox="0 0 24 24" className="relative size-5" style={{ animation: 'hint-bounce 1.6s ease-in-out infinite' }}>
                <path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flex flex-col gap-0.5 text-left">
              <span className="font-display text-base font-semibold text-fg sm:text-lg">{t('intro.hintDown')}</span>
              <span className="font-mono text-xs text-muted">↑ {t('intro.hintUp')}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
