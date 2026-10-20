import { useI18n } from '../i18n/I18nProvider'
import { lenis } from '../lib/motion'
import { reducedMotion, setMotion } from '../lib/motionPreference'

export function Nav() {
  const { t } = useI18n()

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
      <a href="#intro" data-bubble={t('cursor.home')} className="rounded-full border border-fg/15 bg-surface/70 px-4 py-2 font-display text-sm font-semibold tracking-tight backdrop-blur transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={(e) => (e.preventDefault(), lenis.scrollTo(0))}>
        {t('intro.name')}
      </a>
      <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMotion(reducedMotion)}
        aria-pressed={!reducedMotion}
        data-bubble={t(reducedMotion ? 'nav.motionTurnOn' : 'nav.motionTurnOff')}
        className="flex items-center gap-2 rounded-full border border-fg/15 bg-surface/70 px-3 py-2 font-mono text-xs text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className={`size-2 rounded-full ${reducedMotion ? 'bg-muted' : 'bg-accent shadow-[0_0_8px_var(--c-accent)]'}`} aria-hidden />
        <span className="hidden sm:inline">{t('nav.motion')}</span>
        <span>{t(reducedMotion ? 'nav.off' : 'nav.on')}</span>
      </button>
      <button
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
