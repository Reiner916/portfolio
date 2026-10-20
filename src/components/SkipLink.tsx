import { useI18n } from '../i18n/I18nProvider'
import { lenis } from '../lib/motion'

// Lien d'évitement : visible seulement au clavier (Tab), il saute l'intro pour aller directement au contenu.
export function SkipLink() {
  const { t } = useI18n()
  return (
    <a
      href="#about"
      onClick={(e) => {
        e.preventDefault()
        lenis.scrollTo('#about', { immediate: true, force: true })
        document.getElementById('about')?.focus({ preventScroll: true })
      }}
      className="fixed top-3 left-1/2 z-[200] -translate-x-1/2 -translate-y-24 rounded-full bg-accent px-5 py-2 font-medium text-bg transition-transform focus:translate-y-0"
    >
      {t('nav.skipContent')}
    </a>
  )
}
