import { useLayoutEffect, useRef } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { gsap } from '../../lib/motion'
import { NavMenu } from './NavMenu'
import { goTo, LangSwitch, NAV_SECTIONS, useActiveSection } from './shared'

// Menu principal : barre flottante en haut ; une pastille turquoise glisse sous la section en cours.
// Sur mobile, elle laisse la place au bouton "Menu" et à son rideau plein écran (NavMenu).
export function NavBar() {
  const { t, lang } = useI18n()
  const active = useActiveSection()
  const barRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)

  // La pastille se déplace et s'étire jusqu'au lien actif
  useLayoutEffect(() => {
    const link = barRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`)
    if (!link) {
      gsap.to(pillRef.current, { autoAlpha: 0, duration: 0.3 })
      return
    }
    gsap.to(pillRef.current, { autoAlpha: 1, x: link.offsetLeft, width: link.offsetWidth, duration: 0.6, ease: 'elastic.out(1, 0.75)' })
  }, [active, lang])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 hidden items-center justify-between gap-4 px-8 py-4 md:flex">
        <a href="#intro" onClick={(e) => (e.preventDefault(), goTo('intro'))} data-bubble={t('cursor.home')} className="rounded-full border border-fg/15 bg-surface/70 px-4 py-2 font-display text-sm font-semibold backdrop-blur hover:border-accent hover:text-accent">
          {t('intro.name')}
        </a>
        <nav aria-label={t('nav.menu')}>
          <div ref={barRef} className="relative flex rounded-full border border-fg/15 bg-surface/70 p-1 backdrop-blur">
            <span ref={pillRef} aria-hidden className="absolute top-1 bottom-1 left-0 rounded-full bg-accent opacity-0 shadow-[0_0_20px_-4px_var(--c-accent)]" />
            {NAV_SECTIONS.map((id) => (
              <a
                key={id}
                data-nav={id}
                href={`#${id}`}
                onClick={(e) => (e.preventDefault(), goTo(id))}
                aria-current={active === id ? 'true' : undefined}
                className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300 lg:px-4 ${active === id ? 'text-bg' : 'text-fg/75 hover:text-fg'}`}
              >
                {t(`nav.sections.${id}`)}
              </a>
            ))}
          </div>
        </nav>
        <LangSwitch />
      </header>
      <NavMenu className="md:hidden" />
    </>
  )
}
