import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { contact } from '../../data/contact'
import { useI18n } from '../../i18n/I18nProvider'
import { gsap, lenis, prefersReducedMotion } from '../../lib/motion'
import { goTo, LangSwitch, NAV_SECTIONS, useActiveSection } from './shared'

// Menu mobile : bouton "Menu" qui ouvre un rideau plein écran avec de grands liens numérotés.
// Le rideau descend (clip-path, 0.8 s "expo.inOut"), puis les liens montent un à un (masques, "power4.out").
export function NavMenu({ showName = true, className = '' }: { showName?: boolean; className?: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const active = useActiveSection()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(panelRef.current, { clipPath: 'inset(0% 0% 100% 0%)', visibility: 'hidden' })
      tlRef.current = gsap
        .timeline({ paused: true })
        .set(panelRef.current, { visibility: 'visible' })
        .to(panelRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: prefersReducedMotion ? 0.01 : 0.8, ease: 'expo.inOut' })
        .from('[data-menu-link]', { yPercent: 110, duration: 0.8, ease: 'power4.out', stagger: 0.06 }, '-=0.3')
        .from('[data-menu-extra]', { opacity: 0, y: 20, duration: 0.5, stagger: 0.05 }, '-=0.5')
    }, panelRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (open) {
      lenis.stop()
      tlRef.current?.timeScale(1).play()
    } else if (tlRef.current && tlRef.current.progress() > 0) {
      tlRef.current.timeScale(1.6).reverse()
      lenis.start()
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const navigate = (id: string) => {
    setOpen(false)
    lenis.start()
    goTo(id)
  }

  return (
    <div className={className}>
      <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-5 py-4 sm:px-8">
        {showName ? (
          <a href="#intro" onClick={(e) => (e.preventDefault(), navigate('intro'))} data-bubble={t('cursor.home')} className="rounded-full border border-fg/15 bg-surface/70 px-4 py-2 font-display text-sm font-semibold backdrop-blur hover:border-accent hover:text-accent">
            {t('intro.name')}
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="menu-panel"
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-bg shadow-[0_0_24px_-6px_var(--c-accent)] transition-transform hover:scale-105"
        >
          <span className="relative block h-3 w-4" aria-hidden>
            <span className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0.5'}`} />
            <span className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-2'}`} />
          </span>
          {open ? t('nav.close') : t('nav.menu')}
        </button>
      </header>

      <div ref={panelRef} id="menu-panel" className="fixed inset-0 z-[55] flex flex-col bg-surface px-5 pt-24 pb-8 sm:px-12" aria-hidden={!open}>
        <nav aria-label={t('nav.menu')} className="flex flex-1 flex-col justify-center">
          <ol className="flex flex-col gap-1 sm:gap-2">
            {NAV_SECTIONS.map((id, i) => (
              <li key={id} className="overflow-hidden">
                <a
                  data-menu-link
                  href={`#${id}`}
                  tabIndex={open ? 0 : -1}
                  onClick={(e) => (e.preventDefault(), navigate(id))}
                  className={`group flex items-baseline gap-4 font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[1.05] font-bold tracking-tight transition-colors ${active === id ? 'text-accent' : 'text-fg hover:text-accent'}`}
                >
                  <span className="font-mono text-sm font-medium text-accent sm:text-base">{String(i + 1).padStart(2, '0')}</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-3">{t(`nav.sections.${id}`)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-fg/10 pt-6">
          <div data-menu-extra className="flex flex-col gap-1 font-mono text-sm">
            <a href={`mailto:${contact.email}`} className="text-fg hover:text-accent">{contact.email}</a>
            <span className="text-muted">{contact.phone}</span>
          </div>
          <div data-menu-extra>
            <LangSwitch />
          </div>
        </div>
      </div>
    </div>
  )
}
