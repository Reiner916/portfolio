import { useLayoutEffect, useRef } from 'react'
import { projects, type Project } from '../data/projects'
import { SectionTitle } from '../components/SectionTitle'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { DirectoryMock, Screenshots, TerminalMock } from './projects/Mockups'

export function Projects() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-project]').forEach((row) => {
        const visual = row.querySelector<HTMLElement>('[data-visual]')!

        // Rotation au scroll — code et valeurs de Codrops (Rotating On-Scroll Animations, démo 1) :
        // orientation de départ aléatoire (rotationX 70→120, rotationY/Z ±20), arrivée à l'opposé,
        // scrub, de "top bottom+=20%" à "bottom top-=20%", et une profondeur z = sin(progression·π)·-50
        const rotationX = gsap.utils.random(70, 120)
        const rotationY = gsap.utils.random(-20, 20)
        const rotationZ = gsap.utils.random(-20, 20)
        const setZ = gsap.quickSetter(visual, 'z', 'px')
        gsap.fromTo(
          visual,
          { rotationX, rotationY, rotationZ },
          {
            rotationX: -rotationX,
            rotationY: -rotationY,
            rotationZ: -rotationZ,
            ease: 'none',
            scrollTrigger: {
              trigger: visual,
              start: 'top bottom+=20%',
              end: 'bottom top-=20%',
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => setZ(Math.sin(self.progress * Math.PI) * -50),
            },
          },
        )

        // 2e capture : elle glisse plus vite que la 1re (profondeur)
        const overlay = row.querySelector('[data-shot-overlay]')
        if (overlay) {
          gsap.fromTo(overlay, { y: 140 }, { y: -40, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1 } })
        }

        // Balayage nuit → jour sur la capture principale, piloté par le scroll
        const day = row.querySelector<HTMLElement>('[data-day]')
        const line = row.querySelector<HTMLElement>('[data-wipe]')
        if (day && line) {
          const wipe = { x: 100 }
          gsap.to(wipe, {
            x: 0,
            ease: 'power1.inOut',
            scrollTrigger: { trigger: row, start: 'top 45%', end: 'bottom 55%', scrub: 1 },
            onUpdate: () => {
              day.style.clipPath = `inset(0 0 0 ${wipe.x}%)`
              line.style.left = `${wipe.x}%`
              line.style.opacity = wipe.x > 99 || wipe.x < 1 ? '0' : '1'
            },
          })
        }

        // Texte : apparition en cascade
        gsap.from(row.querySelectorAll('[data-reveal]'), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: row, start: 'top 75%' },
        })
      })
      // Texte géant qui traverse l'écran pendant la section (Codrops ".mark") : x 100vw → -100 %, scrub
      gsap.fromTo(
        '[data-mark]',
        { x: '100vw' },
        { x: '-100%', ease: 'none', scrollTrigger: { trigger: rootRef.current, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [t])

  return (
    <section ref={rootRef} id="projects" className="relative z-10 mx-auto max-w-6xl px-5 py-32 sm:px-8">
      <SectionTitle eyebrow={t('projects.eyebrow')} title={t('projects.title')} />

      {/* Défilé géant en arrière-plan (fixe pendant la section, comme chez Codrops) */}
      <div aria-hidden className="pointer-events-none sticky top-1/2 z-0 -mb-[1em] h-0 overflow-visible">
        <div data-mark className="flex w-max -translate-y-1/2 gap-12 font-display text-[18vw] leading-none font-bold whitespace-nowrap text-transparent uppercase [-webkit-text-stroke:1px_color-mix(in_oklab,var(--c-accent)_35%,transparent)]">
          <span>{t('projects.eyebrow')}</span>
          <span>{t('projects.eyebrow')}</span>
        </div>
      </div>

      <div className="relative z-10 mt-24 flex flex-col gap-32 sm:gap-40">
        {projects.map((project, i) => (
          <ProjectRow key={project.key} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { t } = useI18n()
  const base = `projects.items.${project.key}`
  const reversed = index % 2 === 1
  const points = [0, 1, 2, 3].map((i) => t(`${base}.points.${i}`)).filter((p) => !p.startsWith(base))

  return (
    <article data-project className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      <div className={reversed ? 'lg:order-2' : ''}>
        <div data-reveal className="flex items-center gap-4">
          <span className="font-display text-6xl leading-none font-bold text-transparent [-webkit-text-stroke:1.5px_var(--c-accent)] sm:text-7xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          {project.featured && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">{t('projects.featured')}</span>
          )}
        </div>
        <h3 data-reveal className="mt-6 font-display text-3xl leading-tight font-bold text-fg sm:text-4xl">
          {t(`${base}.title`)}
        </h3>
        <p data-reveal className="mt-4 leading-relaxed text-fg/75">
          {t(`${base}.summary`)}
        </p>

        <ul className="mt-6 flex flex-col gap-2">
          {points.map((point) => (
            <li key={point} data-reveal className="flex items-center gap-3 text-sm text-fg/85">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent" aria-hidden>
                <svg viewBox="0 0 12 12" className="size-3">
                  <path d="m2.5 6.5 2.2 2L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-6 flex flex-wrap gap-2" aria-label={t('projects.stack')}>
          {project.stack.map((tech) => (
            <span key={tech} className="rounded-full border border-fg/10 bg-surface/60 px-3 py-1 font-mono text-xs text-fg/80">
              {tech}
            </span>
          ))}
        </div>

        <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
          {project.demo && <LinkButton href={project.demo} primary label={t('projects.demo')} />}
          {project.github && <LinkButton href={project.github} label={t('projects.github')} bubble={t('cursor.github')} />}
          {!project.demo && !project.github && <span className="font-mono text-xs text-muted">{t('projects.soon')}</span>}
        </div>
      </div>

      {/* perspective 900px sur le conteneur, comme ".gallery__item-wrap" chez Codrops */}
      <div className={`[perspective:900px] ${reversed ? 'lg:order-1' : ''}`}>
      <div data-visual className="will-change-transform">
        {project.shots ? (
          <Screenshots shots={project.shots} alt={`${t('projects.shot')} · ${t(`${base}.title`)}`} />
        ) : project.visual === 'browser' ? (
          <DirectoryMock />
        ) : (
          <TerminalMock />
        )}
      </div>
      </div>
    </article>
  )
}

function LinkButton({ href, label, primary = false, bubble }: { href: string; label: string; primary?: boolean; bubble?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-bubble={bubble}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        primary ? 'bg-accent text-bg' : 'border border-fg/20 text-fg hover:border-accent hover:text-accent'
      }`}
    >
      {label} <span aria-hidden>↗</span>
    </a>
  )
}
