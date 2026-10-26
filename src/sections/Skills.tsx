import { useLayoutEffect, useRef } from 'react'
import { CardFan } from '../components/CardFan'
import { Marquee } from '../components/Marquee'
import { SpotlightCard } from '../components/SpotlightCard'
import { marqueeTechs, skillGroups, type Skill } from '../data/skills'
import { SectionTitle } from '../components/SectionTitle'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, prefersReducedMotion } from '../lib/motion'

// Couleur du badge selon le niveau (repère visuel immédiat, comme Easy / Medium / Hard chez Capsule)
const levelStyle = {
  1: 'border-fg/15 text-muted',
  2: 'border-fg/20 text-fg/80',
  3: 'border-accent-2/50 bg-accent-2/10 text-accent-2',
  4: 'border-accent/50 bg-accent/10 text-accent',
  5: 'border-accent bg-accent text-bg',
} as const

export function Skills() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      // Barres de niveau qui se remplissent quand le groupe arrive à l'écran
      gsap.utils.toArray<HTMLElement>('[data-skill-grid]').forEach((grid) => {
        gsap.from(grid.querySelectorAll('[data-bar]'), {
          scaleX: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: grid, start: 'top 75%' },
        })
      })

      gsap.from('[data-learning]', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '[data-learning-list]', start: 'top 90%' },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [t])

  return (
    <section ref={rootRef} id="skills" className="relative z-10 py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionTitle eyebrow={t('skills.eyebrow')} title={t('skills.title')} />
        <p className="mt-6 max-w-xl text-lg text-muted">{t('skills.intro')}</p>
      </div>

      <div className="mt-14 flex flex-col gap-4">
        <Marquee items={marqueeTechs} duration={45} />
        <Marquee items={[...marqueeTechs].reverse()} reverse duration={55} />
      </div>

      <div className="mx-auto mt-20 flex max-w-6xl flex-col gap-16 px-5 sm:px-8">
        {skillGroups.map((group) => (
          <div key={group.key}>
            <h3 className="mb-6 font-display text-2xl font-semibold text-fg">{t(`skills.groups.${group.key}`)}</h3>
            <div data-skill-grid>
              {/* Triées du niveau le plus haut au plus bas, en éventail (Truus) */}
              <CardFan
                items={[...group.skills]
                  .sort((a, b) => b.level - a.level)
                  .map((skill) => ({ key: skill.key, node: <SkillCard skill={skill} /> }))}
              />
            </div>
          </div>
        ))}

        <div>
          <h3 className="font-display text-2xl font-semibold text-fg">{t('skills.groups.learning')}</h3>
          <p className="mt-2 mb-6 font-mono text-xs text-muted">{t('skills.learning.context')}</p>
          {/* Programme du BTS SIO (3 blocs du référentiel), en 3 groupes */}
          <div data-learning-list className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((g) => {
              const base = `skills.learning.groups.${g}`
              const items = Array.from({ length: 10 }, (_, i) => t(`${base}.items.${i}`)).filter((item) => !item.startsWith(base))
              return (
                <div key={g} data-learning className="rounded-3xl border border-dashed border-accent-2/40 bg-surface/40 p-5 backdrop-blur-sm sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-semibold text-fg">{t(`${base}.title`)}</p>
                    <span className="rounded-full border border-accent-2/40 bg-accent-2/10 px-2.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-accent-2">
                      {t('skills.learning.tag')}
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                      <li key={item} className="relative overflow-hidden rounded-full border border-fg/10 bg-bg/50 px-3 py-1.5 text-sm text-fg/85">
                        {/* Reflet qui passe en boucle : "en cours de chargement" */}
                        <span
                          aria-hidden
                          className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-accent-2/20 to-transparent"
                          style={{ animation: `shimmer 3.2s ease-in-out ${(g * 6 + i) * 0.25}s infinite` }}
                        />
                        <span className="relative">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function SkillCard({ skill }: { skill: Skill }) {
  const { t } = useI18n()
  const projects = skill.projects
  return (
    <SpotlightCard className="h-full bg-surface! shadow-[0_10px_25px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 min-w-12 place-items-center rounded-2xl border border-fg/10 bg-bg/60 px-2 font-mono text-sm font-semibold text-accent">
          {skill.glyph}
        </span>
        <span className={`rounded-full border px-3 py-1 font-mono text-xs ${levelStyle[skill.level]}`}>{t(`skills.levels.${skill.level - 1}`)}</span>
      </div>

      <p className="mt-6 font-display text-xl font-semibold text-fg">{t(`skills.items.${skill.key}.name`)}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t(`skills.items.${skill.key}.detail`)}</p>

      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-baseline justify-between font-mono text-xs">
          <span className="text-fg">
            <span className="text-lg font-semibold">{skill.level}</span>
            <span className="text-muted">/5</span>
          </span>
          {projects ? (
            <span className="text-muted">
              {projects} {t(projects > 1 ? 'skills.projects' : 'skills.project')}
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-2 overflow-hidden rounded-full bg-fg/8">
              {n <= skill.level && (
                <div data-bar className={`h-full origin-left rounded-full ${skill.level >= 4 ? 'bg-accent' : skill.level === 3 ? 'bg-accent-2' : 'bg-fg/50'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </SpotlightCard>
  )
}
