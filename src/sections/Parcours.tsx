import { useLayoutEffect, useRef } from 'react'
import { SectionTitle } from '../components/SectionTitle'
import { education, experiences, otherJobs, type ParcoursItem } from '../data/parcours'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, prefersReducedMotion } from '../lib/motion'

// Frise du parcours, deux colonnes (expérience / formation) :
//  - la ligne se remplit au scroll (barre de progression façon Capsule, scrub)
//  - chaque point apparaît avec le rebond des stickers Truus (scale 0 → 1, rotation -30 → 0, 1.7 s, "elastic.out(1, 0.4)")
//  - le contenu monte en fondu
export function Parcours() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-timeline]').forEach((timeline) => {
        gsap.fromTo(
          timeline.querySelector('[data-progress]'),
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 60%', scrub: true } },
        )
      })
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((step) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 78%', toggleActions: 'play none none reverse' } })
        tl.fromTo(step.querySelector('[data-dot]'), { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 1.7, ease: 'elastic.out(1, 0.4)' })
        tl.from(step.querySelector('[data-body]'), { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0.05)
      })
      gsap.from('[data-other]', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-other-list]', start: 'top 85%' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [t])

  return (
    <section ref={rootRef} id="parcours" className="relative z-10 mx-auto max-w-6xl px-5 py-32 sm:px-8">
      <SectionTitle eyebrow={t('parcours.eyebrow')} title={t('parcours.title')} />

      <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-12">
        <Timeline title={t('parcours.experienceTitle')} items={experiences} />
        <Timeline title={t('parcours.educationTitle')} items={education} />
      </div>

      {/* Autres expériences : version discrète */}
      <div className="mt-20">
        <h3 className="mb-4 font-mono text-xs tracking-wider text-muted uppercase">{t('parcours.otherTitle')}</h3>
        <ul data-other-list className="divide-y divide-fg/5 rounded-2xl border border-fg/8 bg-surface/30 backdrop-blur-sm">
          {otherJobs.map((key) => (
            <li key={key} data-other className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-6">
              <span className="font-mono text-xs text-muted sm:pt-0.5">{t(`parcours.other.${key}.date`)}</span>
              <span>
                <span className="text-fg/90">{t(`parcours.other.${key}.role`)}</span>
                <span className="text-muted"> · {t(`parcours.other.${key}.detail`)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Timeline({ title, items }: { title: string; items: ParcoursItem[] }) {
  const { t } = useI18n()
  return (
    <div>
      <h3 className="mb-10 font-display text-2xl font-semibold text-fg">{title}</h3>
      <ol data-timeline className="relative flex flex-col gap-12 pl-10">
        {/* Rail + remplissage au scroll */}
        <span aria-hidden className="absolute top-2 bottom-2 left-[11px] w-px bg-fg/10" />
        <span aria-hidden data-progress className="absolute top-2 bottom-2 left-[11px] w-px origin-top bg-accent shadow-[0_0_12px_var(--c-accent)]" />
        {items.map(({ key }) => {
          const base = `parcours.items.${key}`
          const points = [0, 1, 2].map((i) => t(`${base}.points.${i}`)).filter((p) => !p.startsWith(base))
          const tags = [0, 1, 2, 3].map((i) => t(`${base}.tags.${i}`)).filter((p) => !p.startsWith(base))
          return (
            <li key={key} data-step className="relative">
              <span
                data-dot
                aria-hidden
                className="absolute top-1 -left-10 grid size-6 place-items-center rounded-full border border-accent/50 bg-bg shadow-[0_0_16px_-4px_var(--c-accent)]"
              >
                <span className="size-2 rounded-full bg-accent" />
              </span>
              <div data-body>
                <p className="font-mono text-xs text-accent">{t(`${base}.date`)}</p>
                <p className="mt-2 font-display text-xl leading-snug font-semibold text-fg">{t(`${base}.role`)}</p>
                <p className="mt-1 text-sm text-muted">{t(`${base}.place`)}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed text-fg/90">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent-2" />
                      {point}
                    </li>
                  ))}
                </ul>
                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-fg/10 bg-surface/60 px-2.5 py-0.5 font-mono text-[11px] text-fg/90">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
