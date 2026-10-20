import { useLayoutEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, lenis, ScrollTrigger } from '../lib/motion'

export function Nav() {
  const { t } = useI18n()
  const skipRef = useRef<HTMLButtonElement>(null)

  // "Passer l'intro" n'a plus de sens une fois l'intro passée : il disparaît (et revient si on remonte)
  useLayoutEffect(() => {
    const show = (visible: boolean) => gsap.to(skipRef.current, { autoAlpha: visible ? 1 : 0, y: visible ? 0 : -10, duration: 0.3, ease: 'power2.out' })
    const st = ScrollTrigger.create({
      trigger: '#about',
      start: 'top 85%',
      onEnter: () => show(false),
      onLeaveBack: () => show(true),
    })
    return () => st.kill()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
      <a href="#intro" data-bubble={t('cursor.home')} className="rounded-full border border-fg/15 bg-surface/70 px-4 py-2 font-display text-sm font-semibold tracking-tight backdrop-blur transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={(e) => (e.preventDefault(), lenis.scrollTo(0))}>
        {t('intro.name')}
      </a>
      <div className="flex items-center gap-2">
      <button
        ref={skipRef}
        type="button"
        onClick={() => lenis.scrollTo('#about', { duration: 2.2 })}
        data-bubble={t('cursor.go')}
        className="rounded-full border border-fg/15 bg-surface/70 px-4 py-2 font-mono text-xs text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {t('nav.skipIntro')} →
      </button>
      </div>
    </header>
  )
}
