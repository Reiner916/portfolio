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
