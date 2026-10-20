import { useLayoutEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { sceneReady, startIntro } from '../lib/loading'
import { gsap, lenis, prefersReducedMotion } from '../lib/motion'

// Preloader — timeline reprise de Capsule :
//  - entrée après 0.5 s : lettres x 100 % → 0 % (masquées), stagger 0.05, 1 s, "power4.inOut"
//  - lignes du bas y 100 % → 0 %, stagger 0.1, 1 s, "power4.inOut", à 0.25 s
//  - grande barre de progression en 3 bonds aléatoires ("power3.out"), la dernière à 100 %
//  - sortie : lettres x → -100 % (+0.15 s), lignes y → -100 % (0.5 s), barre opacity 0 (0.7 s, "power3.out")
// Seule différence : la barre dure BAR_DURATION au lieu de 3.5 s, pour qu'un recruteur n'attende pas.
const BAR_DURATION = 1.6

function progressBar(target: Element, onUpdate: () => void, duration = BAR_DURATION) {
  const tl = gsap.timeline()
  const steps = 3
  let reached = 0
  for (let i = 0; i < steps; i++) {
    const value = i === steps - 1 ? 1 : Math.min(reached + Math.random() * 0.3 + 0.1, 0.9)
    reached = value
    tl.to(target, { scaleX: value, duration: duration / steps, ease: 'power3.out', onUpdate })
  }
  return tl
}

export function Preloader() {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const name = t('intro.name')

  useLayoutEffect(() => {
    lenis.stop()
    let cancelled = false
    const ctx = gsap.context(() => {
      const renderCounter = () => {
        const scale = Number(gsap.getProperty(barRef.current, 'scaleX'))
        if (counterRef.current) counterRef.current.textContent = String(Math.round(scale * 100)).padStart(3, '0')
      }

      gsap.set('[data-char]', { x: '100%' })
      gsap.set('[data-line]', { y: '100%' })

      const intro = gsap
        .timeline({ delay: prefersReducedMotion ? 0 : 0.5 })
        .to('[data-char]', { x: '0%', stagger: 0.05, duration: 1, ease: 'power4.inOut' })
        .to('[data-line]', { y: '0%', stagger: 0.1, duration: 1, ease: 'power4.inOut' }, 0.25)
        .add(progressBar(barRef.current!, renderCounter), '<')

      const ready = Promise.all([sceneReady, document.fonts.ready, new Promise<void>((r) => intro.eventCallback('onComplete', () => r()))])
      ready.then(() => {
        if (cancelled) return
        ctx.add(() => {
          gsap
            .timeline({
              onComplete: () => {
                lenis.start()
                setDone(true)
              },
            })
            .to('[data-char]', { x: '-100%', stagger: 0.05, duration: 1, ease: 'power4.inOut' }, '+=0.15')
            .to('[data-line]', { y: '-100%', stagger: 0.1, duration: 0.5, ease: 'power4.inOut' }, '-=0.1')
            .to(barRef.current, { opacity: 0, duration: 0.7, ease: 'power3.out' }, '<')
            // Le rideau remonte et l'arrivée de la caméra démarre en même temps
            .add(startIntro, '-=0.2')
            .to(rootRef.current, { yPercent: -100, borderBottomLeftRadius: '40% 12%', borderBottomRightRadius: '40% 12%', duration: 1.1, ease: 'expo.inOut' }, '<')
        })
      })
    }, rootRef)
    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [])

  if (done) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden bg-bg" role="status" aria-live="polite">
      <span className="sr-only">{t('preloader.loading')}</span>
      {/* Grande barre de progression (55 % de large, toute la hauteur), comme chez Capsule */}
      <div
        ref={barRef}
        className="absolute top-0 left-[22.5%] h-full w-[55%] origin-left bg-surface max-[800px]:left-0 max-[800px]:w-full"
        style={{ transform: 'scaleX(0)' }}
      />
      <div className="relative flex h-full flex-col px-5 py-6 sm:px-8">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex font-display text-[clamp(2.5rem,9vw,7.5rem)] leading-none font-bold tracking-tight" aria-label={name}>
            {[...name].map((char, i) => (
              // Masque par lettre (overflow clip), comme le "mask" de SplitText chez Capsule
              <span key={i} className="inline-block overflow-clip whitespace-pre" aria-hidden>
                <span data-char className="inline-block">
                  {char}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between gap-6 font-mono text-xs text-muted sm:text-sm">
          <span className="overflow-clip">
            <span data-line className="block">
              {t('preloader.label')}
            </span>
          </span>
          <span className="overflow-clip text-fg tabular-nums">
            <span data-line className="block">
              <span ref={counterRef}>000</span>%
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
