import { useLayoutEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { sceneReady, startIntro } from '../lib/loading'
import { gsap, lenis, prefersReducedMotion } from '../lib/motion'

const MIN_DURATION = 1.3 // secondes : assez pour lire le nom, sans faire attendre

export function Preloader() {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const name = t('intro.name')

  useLayoutEffect(() => {
    lenis.stop()
    let cancelled = false
    const ctx = gsap.context(() => {
      const count = { v: 0 }
      const render = () => {
        if (counterRef.current) counterRef.current.textContent = String(Math.round(count.v)).padStart(3, '0')
        if (barRef.current) barRef.current.style.transform = `scaleX(${count.v / 100})`
      }

      // Entrée : les lettres montent une à une
      gsap.from('[data-char]', { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.035, delay: 0.1 })
      gsap.from('[data-fade]', { opacity: 0, duration: 0.6, delay: 0.3 })

      // Compteur : avance jusqu'à 90, puis 100 quand tout est prêt
      const fill = gsap.to(count, { v: 90, duration: MIN_DURATION, ease: 'power2.out', onUpdate: render })
      const ready = Promise.all([sceneReady, document.fonts.ready, new Promise((r) => setTimeout(r, MIN_DURATION * 1000))])

      ready.then(() => {
        if (cancelled) return
        // Lancé hors du callback synchrone : on le rattache au contexte pour qu'il soit nettoyé
        ctx.add(() => exitAnimation())
      })

      const exitAnimation = () => {
        fill.kill()
        const exit = gsap.timeline({
          onComplete: () => {
            lenis.start()
            setDone(true)
          },
        })
        exit.to(count, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: render })
        exit.to('[data-char]', { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.02 }, '+=0.1')
        exit.to('[data-fade]', { opacity: 0, duration: 0.3 }, '<')
        // Le rideau remonte ; l'intro (arrivée de la caméra) démarre pendant qu'il se retire
        exit.add(startIntro, '-=0.15')
        exit.to(rootRef.current, {
          yPercent: -100,
          borderBottomLeftRadius: '40% 12%',
          borderBottomRightRadius: '40% 12%',
          duration: prefersReducedMotion ? 0.3 : 1.1,
          ease: 'expo.inOut',
        }, '<')
      }
    }, rootRef)
    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [])

  if (done) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] flex flex-col bg-bg px-5 py-6 sm:px-8" role="status" aria-live="polite">
      <span className="sr-only">{t('preloader.loading')}</span>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex overflow-hidden font-display text-[clamp(2.5rem,9vw,7.5rem)] leading-none font-bold tracking-tight" aria-label={name}>
          {[...name].map((char, i) => (
            <span key={i} data-char className="inline-block whitespace-pre" aria-hidden>
              {char}
            </span>
          ))}
        </div>
      </div>
      <div data-fade className="flex items-end justify-between gap-6 font-mono text-xs text-muted sm:text-sm">
        <span>{t('preloader.label')}</span>
        <span className="relative mb-1.5 hidden h-px flex-1 overflow-hidden bg-fg/10 sm:block">
          <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </span>
        <span className="text-fg tabular-nums">
          <span ref={counterRef}>000</span>%
        </span>
      </div>
    </div>
  )
}
