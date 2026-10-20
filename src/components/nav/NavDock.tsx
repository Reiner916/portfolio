import { useRef, type MouseEvent } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { goTo, LangSwitch, NAV_SECTIONS, SectionIcon, useActiveSection } from './shared'

const MAGNIFY_RANGE = 140 // px : distance à laquelle une icône commence à grossir
const MAGNIFY_MAX = 0.55 // +55 % sous le curseur

// Option B : dock en bas de l'écran, façon macOS (inspiré du Dock de Magic UI) :
// les icônes grossissent selon la distance au curseur, la section en cours est signalée par un point.
export function NavDock() {
  const { t } = useI18n()
  const active = useActiveSection()
  const dockRef = useRef<HTMLDivElement>(null)

  const onMove = (e: MouseEvent) => {
    if (prefersReducedMotion) return
    dockRef.current!.querySelectorAll<HTMLElement>('[data-dock-item]').forEach((item) => {
      const rect = item.getBoundingClientRect()
      const d = Math.abs(e.clientX - (rect.left + rect.width / 2))
      const scale = 1 + MAGNIFY_MAX * Math.max(0, 1 - d / MAGNIFY_RANGE)
      gsap.to(item, { scale, y: -(scale - 1) * 22, duration: 0.25, ease: 'power3.out' })
    })
  }
  const onLeave = () => gsap.to(dockRef.current!.querySelectorAll('[data-dock-item]'), { scale: 1, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
        <a href="#intro" onClick={(e) => (e.preventDefault(), goTo('intro'))} data-bubble={t('cursor.home')} className="pointer-events-auto rounded-full border border-fg/15 bg-surface/70 px-4 py-2 font-display text-sm font-semibold backdrop-blur hover:border-accent hover:text-accent">
          {t('intro.name')}
        </a>
        <LangSwitch className="pointer-events-auto" />
      </header>
      <nav aria-label={t('nav.menu')} className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
        <div ref={dockRef} onMouseMove={onMove} onMouseLeave={onLeave} className="flex items-end gap-1 rounded-2xl border border-fg/15 bg-surface/80 px-2 pt-2 pb-1.5 backdrop-blur-md sm:gap-2 sm:px-3">
          {NAV_SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => (e.preventDefault(), goTo(id))}
              aria-current={active === id ? 'true' : undefined}
              data-bubble={t(`nav.sections.${id}`)}
              className="group flex flex-col items-center"
            >
              <span data-dock-item className={`grid size-10 origin-bottom place-items-center rounded-xl border transition-colors ${active === id ? 'border-accent/60 bg-accent/15 text-accent' : 'border-fg/10 bg-bg/60 text-fg/80 group-hover:text-fg'}`}>
                <SectionIcon id={id} />
              </span>
              <span className="mt-1 hidden text-[10px] text-muted sm:block">{t(`nav.sections.${id}`)}</span>
              <span aria-hidden className={`mt-0.5 size-1 rounded-full ${active === id ? 'bg-accent' : 'bg-transparent'}`} />
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}
