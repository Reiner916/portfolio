import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { ScrollRevealText } from '../components/ScrollRevealText'
import { SectionTitle } from '../components/SectionTitle'
import { SpotlightCard } from '../components/SpotlightCard'
import { cefrScale, languages, rhythmWeeks } from '../data/about'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, prefersReducedMotion } from '../lib/motion'

export function About() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      // Cartes : apparition puis animation interne de chacune
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%' } })
        tl.from(card, { y: 60, opacity: 0, duration: 1, ease: 'expo.out' })
        const cells = card.querySelectorAll('[data-cell]')
        if (cells.length) tl.from(cells, { scale: 0.4, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.05 }, 0.25)
        const segments = card.querySelectorAll('[data-segment]')
        if (segments.length) tl.from(segments, { scaleX: 0, duration: 0.45, ease: 'power3.out', stagger: 0.09 }, 0.3)
        const levels = card.querySelectorAll('[data-level]')
        if (levels.length) tl.from(levels, { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.15 }, 0.3)
      })
    }, rootRef)
    return () => ctx.revert()
  }, [t])

  return (
    // Remonte sous la fin de la plongée : le titre arrive dès que l'écran remplit le cadre
    <section ref={rootRef} id="about" tabIndex={-1} className="outline-none relative z-10 mx-auto -mt-[60svh] max-w-6xl px-5 pt-24 pb-32 sm:px-8">
      <SectionTitle eyebrow={t('about.eyebrow')} title={t('about.title')} className="max-w-4xl" />
      <span className="mt-10 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
        {t('about.status')}
      </span>

      <ScrollRevealText
        text={t('about.text')}
        className="mt-12 max-w-5xl font-display text-2xl leading-snug font-medium text-fg sm:text-4xl sm:leading-tight"
      />

      <div className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RhythmCard />
        <TrainingCard />
        <MobilityCard />
        <LanguagesCard />
      </div>
    </section>
  )
}

function CardLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs tracking-wider text-accent uppercase">{children}</p>
}

function RhythmCard() {
  const { t } = useI18n()
  return (
    <SpotlightCard data-card className="sm:col-span-2">
      <CardLabel>{t('about.rhythm.label')}</CardLabel>
      <p className="mt-4 font-display text-2xl font-semibold text-fg sm:text-3xl">{t('about.rhythm.title')}</p>
      <p className="mt-1 text-sm text-muted">{t('about.rhythm.detail')}</p>

      <div className="mt-8 grid grid-cols-[auto_repeat(5,minmax(0,1fr))] items-center gap-2 sm:gap-3">
        <span />
        {[0, 1, 2, 3, 4].map((d) => (
          <span key={d} className={`text-center font-mono text-xs ${d === 2 ? 'text-fg' : 'text-muted'}`}>
            {t(`about.rhythm.days.${d}`)}
          </span>
        ))}
        {rhythmWeeks.map((week, w) => (
          <Row key={w} label={`${t('about.rhythm.week')} ${w + 1}`}>
            {week.map((kind, d) => (
              <span
                key={d}
                data-cell
                className={`grid h-11 place-items-center rounded-xl font-mono text-[11px] sm:h-12 sm:text-xs ${
                  kind === 'company'
                    ? 'bg-accent font-semibold text-bg shadow-[0_0_24px_-6px_var(--c-accent)]'
                    : 'border border-accent-2/50 bg-accent-2/10 text-accent-2'
                } ${d === 2 ? 'ring-2 ring-fg/25 ring-offset-2 ring-offset-surface' : ''}`}
              >
                <span className="hidden sm:inline">{t(`about.rhythm.${kind}`)}</span>
                <span className="sm:hidden">{t(`about.rhythm.${kind}`).slice(0, 3)}.</span>
              </span>
            ))}
          </Row>
        ))}
      </div>
    </SpotlightCard>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="pr-2 font-mono text-xs whitespace-nowrap text-muted">{label}</span>
      {children}
    </>
  )
}

function TrainingCard() {
  const { t } = useI18n()
  return (
    <SpotlightCard data-card className="flex flex-col">
      <CardLabel>{t('about.training.label')}</CardLabel>
      <svg viewBox="0 0 48 48" className="mt-6 size-14 text-accent" style={{ animation: 'float 4s ease-in-out infinite' }} aria-hidden>
        <path d="M24 10 4 19l20 9 20-9-20-9Z" fill="currentColor" opacity="0.9" />
        <path d="M12 23v9c0 3 5.4 6 12 6s12-3 12-6v-9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M42 20v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className="mt-auto pt-8 font-display text-4xl font-bold text-fg">{t('about.training.title')}</p>
      <p className="mt-1 text-sm text-fg/90">{t('about.training.detail')}</p>
      <p className="mt-1 font-mono text-xs text-muted">{t('about.training.since')}</p>
    </SpotlightCard>
  )
}

function MobilityCard() {
  const { t } = useI18n()
  return (
    <SpotlightCard data-card className="flex flex-col">
      <CardLabel>{t('about.mobility.label')}</CardLabel>
      {/* Petit trajet animé : un point qui file le long d'une route pointillée */}
      <svg viewBox="0 0 200 70" className="mt-6 h-16 w-full" aria-hidden>
        <path id="route" d="M10 55 C 50 55, 60 15, 100 25 S 160 60, 188 18" fill="none" stroke="var(--c-muted)" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 6" />
        <circle r="5" fill="var(--c-accent)">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M10 55 C 50 55, 60 15, 100 25 S 160 60, 188 18" />
        </circle>
        <circle cx="10" cy="55" r="4" fill="var(--c-accent-2)" />
        <path d="M188 4c-5 0-9 4-9 9 0 7 9 15 9 15s9-8 9-15c0-5-4-9-9-9Z" fill="var(--c-accent)" />
        <circle cx="188" cy="13" r="3" fill="var(--c-bg)" />
      </svg>
      <p className="mt-auto pt-6 font-display text-2xl font-semibold text-fg">{t('about.mobility.title')}</p>
      <p className="mt-1 text-sm text-muted">{t('about.mobility.detail')}</p>
    </SpotlightCard>
  )
}

function LanguagesCard() {
  const { t } = useI18n()
  return (
    <SpotlightCard data-card className="sm:col-span-2">
      <CardLabel>{t('about.languages.label')}</CardLabel>
      <div className="mt-6 flex flex-col gap-8">
        {languages.map(({ key, level }, i) => {
          const main = i === 0
          const reached = cefrScale.indexOf(level) + 1
          return (
            <div key={key}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className={`font-display font-semibold ${main ? 'text-3xl text-fg sm:text-4xl' : 'text-xl text-fg/70'}`}>{t(`about.languages.${key}`)}</p>
                  <p className={`mt-1 font-mono text-xs ${main ? 'text-accent' : 'text-muted'}`}>{t(`about.languages.${key}Tag`)}</p>
                </div>
                <span
                  data-level
                  className={`block font-display leading-none font-bold ${main ? 'text-6xl text-accent sm:text-7xl' : 'text-3xl text-fg/50'}`}
                  style={main ? { textShadow: '0 0 32px color-mix(in oklab, var(--c-accent) 60%, transparent)' } : undefined}
                >
                  {level}
                </span>
              </div>
              {/* Échelle CECRL : A1 → C2 */}
              <div className={`mt-4 grid grid-cols-6 gap-1.5 ${main ? '' : 'opacity-70'}`}>
                {cefrScale.map((step, s) => (
                  <div key={step}>
                    <div className={`overflow-hidden rounded-full bg-fg/8 ${main ? 'h-3' : 'h-2'}`}>
                      {s < reached && (
                        <div
                          data-segment
                          className={`h-full origin-left rounded-full ${main ? 'bg-accent shadow-[0_0_14px_var(--c-accent)]' : 'bg-accent-2/60'}`}
                        />
                      )}
                    </div>
                    <p className={`mt-1.5 text-center font-mono text-[10px] ${s === reached - 1 ? (main ? 'text-accent' : 'text-fg/70') : 'text-muted/60'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </SpotlightCard>
  )
}
