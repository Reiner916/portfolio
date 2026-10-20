import { useEffect, useState } from 'react'
import { useI18n, type Lang } from '../../i18n/I18nProvider'
import { lenis, ScrollTrigger } from '../../lib/motion'

// Sections accessibles depuis le menu (ids des <section>), dans l'ordre de la page
export const NAV_SECTIONS = ['about', 'skills', 'projects', 'parcours', 'cv', 'contact'] as const
export type SectionId = (typeof NAV_SECTIONS)[number]

export const goTo = (id: string) => lenis.scrollTo(`#${id}`, { duration: 1.6 })

// Section actuellement à l'écran (null pendant l'intro)
export function useActiveSection() {
  const [active, setActive] = useState<SectionId | null>(null)
  useEffect(() => {
    const triggers = NAV_SECTIONS.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(id),
      }),
    )
    const intro = ScrollTrigger.create({ trigger: '#about', start: 'top 55%', onLeaveBack: () => setActive(null) })
    return () => [...triggers, intro].forEach((t) => t.kill())
  }, [])
  return active
}

// Bouton FR / EN : bascule tout le contenu du site
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  const options: Lang[] = ['fr', 'en']
  return (
    <div role="group" aria-label={t('nav.language')} className={`flex rounded-full border border-fg/15 bg-surface/70 p-0.5 font-mono text-xs backdrop-blur ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={lang === option}
          onClick={() => setLang(option)}
          className={`rounded-full px-2.5 py-1.5 uppercase transition-colors ${lang === option ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Petites icônes des sections (dock)
export function SectionIcon({ id }: { id: SectionId }) {
  const paths: Record<SectionId, string> = {
    about: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
    skills: 'M14.7 6.3a4 4 0 0 0-5.3 5.3L3 18l3 3 6.4-6.4a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.4-.4-2.6 2.4-2.4Z',
    projects: 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14',
    parcours: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a4 4 0 0 1 4-4h6M18 9v6a4 4 0 0 1-4 4H8',
    cv: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
    contact: 'M3 5h18v14H3zM3 6l9 7 9-7',
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[id]} />
    </svg>
  )
}
