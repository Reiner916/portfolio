import { useLayoutEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { sceneReady, startIntro } from '../lib/loading'
import { gsap, lenis, prefersReducedMotion, ScrollTrigger } from '../lib/motion'

// Preloader "gélule" — structure, timeline et valeurs de Capsule, couleurs Lagon :
//  - un calque plein écran (couleur du fond) percé d'une gélule (mask-image + mask-composite: subtract, 40 % de large)
//  - derrière la gélule : une barre turquoise qui se remplit latéralement en 3 bonds aléatoires (3.5 s, "power3.out"),
//    et le nom qui change de couleur quand la barre passe dessous (Capsule utilise mix-blend-mode: difference ;
//    sur du turquoise ça donnerait du rouge, donc ici une copie sombre du nom est découpée au bord de la barre)
//  - lettres x 100 % → 0 % (stagger 0.05, 1 s, "power4.inOut"), lignes du bas y 100 % → 0 % (stagger 0.1)
//  - sortie : lettres x → -100 %, lignes y → -100 %, barre opacity 0 (0.7 s),
//    puis la gélule grandit (scale 6, 4 s, "power3.out") et laisse apparaître le site
const BAR_DURATION = 3.5
const SCENE_WAIT_MAX = 1500 // ms d'attente max pour la 3D une fois l'animation finie

function progressBar(target: Element, onUpdate: () => void) {
  const tl = gsap.timeline()
  const steps = 3
  let reached = 0
  for (let i = 0; i < steps; i++) {
    const value = i === steps - 1 ? 1 : Math.min(reached + Math.random() * 0.3 + 0.1, 0.9)
    reached = value
    tl.to(target, { scaleX: value, duration: BAR_DURATION / steps, ease: 'power3.out', onUpdate })
  }
  return tl
}

export function Preloader() {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const darkNameRef = useRef<HTMLDivElement>(null)
  const name = t('intro.name')

  useLayoutEffect(() => {
    // Le preloader React prend le relais de la gélule statique d'index.html
    document.getElementById('boot')?.remove()
    lenis.stop()
    let cancelled = false
    const ctx = gsap.context(() => {
      const renderCounter = () => {
        const scale = Number(gsap.getProperty(barRef.current, 'scaleX'))
        if (counterRef.current) counterRef.current.textContent = String(Math.round(scale * 100)).padStart(3, '0')
        if (!barRef.current) return
        const right = barRef.current.getBoundingClientRect().right
        if (darkNameRef.current) darkNameRef.current.style.clipPath = `inset(0 ${Math.max(0, window.innerWidth - right)}px 0 0)`
      }

      gsap.set('[data-char]', { x: '100%' })
      gsap.set('[data-line]', { y: '100%' })

      const intro = gsap
        .timeline({ delay: 0.5 })
        .to('[data-char]', { x: '0%', stagger: 0.05, duration: 1, ease: 'power4.inOut' })
        .to('[data-line]', { y: '0%', stagger: 0.1, duration: 1, ease: 'power4.inOut' }, 0.25)
        .add(progressBar(barRef.current!, renderCounter), '<')
      if (prefersReducedMotion) intro.timeScale(4)

      // On attend la fin de l'animation, puis la 3D et les polices au plus 1.5 s de plus :
      // si elle n'est pas prête (PC lent), l'image de la scène la remplace le temps qu'elle arrive.
      const introDone = new Promise<void>((r) => intro.eventCallback('onComplete', () => r()))
      const ready = introDone.then(() =>
        Promise.race([Promise.all([sceneReady, document.fonts.ready]), new Promise<void>((r) => setTimeout(r, SCENE_WAIT_MAX))]),
      )
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
            .to('[data-progress]', { opacity: 0, duration: 0.7, ease: 'power3.out' }, '<')
            .to('[data-mask]', { scale: 6, duration: 4, ease: 'power3.out' }, '<')
            // L'arrivée de la caméra démarre pendant que la gélule s'ouvre
            // Positions recalculées (page complète) juste avant de lancer l'intro
            .add(() => {
              ScrollTrigger.refresh()
              startIntro()
            }, '<')
            .to('[data-mask]', { opacity: 0, duration: 1 }, '<+=1')
            .set(rootRef.current, { pointerEvents: 'none' }, '<')
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
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden" role="status" aria-live="polite">
      <span className="sr-only">{t('preloader.loading')} · {name}</span>

      {/* Contenu de la gélule : fond surface, barre turquoise, nom en "difference" */}
      <div data-progress className="absolute inset-0 bg-surface">
        <div
          ref={barRef}
          className="absolute top-0 left-[22.5%] h-full w-[55%] origin-left bg-accent max-[800px]:left-0 max-[800px]:w-full"
          style={{ transform: 'scaleX(0)' }}
        />
        <NameLayer name={name} className="text-fg" />
        <NameLayer ref={darkNameRef} name={name} className="text-bg" style={{ clipPath: 'inset(0 100% 0 0)' }} />
      </div>

      {/* Calque percé de la gélule */}
      <div data-mask className="preloader-mask absolute inset-0 bg-bg" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-5 py-6 font-mono text-xs text-muted sm:px-8 sm:text-sm">
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
  )
}

// Le nom, lettre par lettre dans des masques (comme le "mask" de SplitText chez Capsule)
function NameLayer({ name, className, style, ref }: { name: string; className: string; style?: CSSProperties; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={`absolute inset-0 grid place-items-center ${className}`} style={style} aria-hidden>
      <div className="flex font-display text-[clamp(1.6rem,3.4vw,3.2rem)] leading-none font-bold tracking-tight">
        {[...name].map((char, i) => (
          <span key={i} className="inline-block overflow-clip whitespace-pre">
            <span data-char className="inline-block">
              {char}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
