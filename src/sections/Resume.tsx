import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SectionTitle } from '../components/SectionTitle'
import { SpotlightCard } from '../components/SpotlightCard'
import { contact } from '../data/contact'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, lenis, prefersReducedMotion } from '../lib/motion'

// Section CV : aperçu incliné (rotation au scroll façon Codrops, en plus doux), bouton "voir" (lecteur PDF en modale)
// et bouton "télécharger".
export function Resume() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-cv-preview]',
        { rotationX: 25, rotationZ: -6, y: 80 },
        { rotationX: 0, rotationZ: -2, y: 0, ease: 'none', scrollTrigger: { trigger: '[data-cv-preview]', start: 'top bottom', end: 'center center', scrub: true } },
      )
      gsap.from('[data-cv-reveal]', { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: rootRef.current, start: 'top 70%' } })
    }, rootRef)
    return () => ctx.revert()
  }, [t])

  // Modale : on fige le scroll fluide pendant la lecture
  // (on ne relance le scroll qu'à la fermeture : au chargement, c'est le preloader qui le gère)
  const wasOpen = useRef(false)
  useEffect(() => {
    const dialog = dialogRef.current!
    if (open) {
      dialog.showModal()
      lenis.stop()
      wasOpen.current = true
    } else if (wasOpen.current) {
      if (dialog.open) dialog.close()
      lenis.start()
      wasOpen.current = false
    }
  }, [open])

  return (
    <section ref={rootRef} id="cv" className="relative z-10 mx-auto max-w-6xl px-5 py-32 sm:px-8">
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <SectionTitle eyebrow={t('resume.eyebrow')} title={t('resume.title')} />
          <p data-cv-reveal className="mt-8 max-w-md text-lg leading-relaxed text-fg/90">
            {t('resume.text')}
          </p>
          <div data-cv-reveal className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-bubble={t('cursor.cv')}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-bg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <EyeIcon /> {t('resume.view')}
            </button>
            <a
              href={contact.cv}
              download
              data-bubble={t('cursor.download')}
              className="inline-flex items-center gap-2 rounded-full border border-fg/20 px-6 py-3 font-medium text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <DownloadIcon /> {t('resume.download')}
            </a>
          </div>
        </div>

        <div className="[perspective:1100px]">
          <button type="button" onClick={() => setOpen(true)} data-bubble={t('cursor.cv')} className="block w-full max-w-md justify-self-center focus-visible:outline-none lg:ml-auto" aria-label={t('resume.view')}>
            <div data-cv-preview className="will-change-transform">
              <SpotlightCard tilt className="p-2! sm:p-3!">
                <img src={contact.cvPreview} alt={t('resume.preview')} width={900} height={1273} loading="lazy" className="block w-full rounded-2xl" />
              </SpotlightCard>
            </div>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialogRef.current && setOpen(false)}
        aria-label={t('resume.dialogTitle')}
        className="m-auto h-[92svh] w-[min(920px,94vw)] max-w-none overflow-hidden rounded-3xl border border-fg/10 bg-surface p-0 text-fg backdrop:bg-bg/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-fg/10 px-4 py-3">
            <p className="font-display font-semibold">{t('resume.dialogTitle')}</p>
            <div className="flex items-center gap-2">
              <a href={contact.cv} target="_blank" rel="noreferrer" className="hidden rounded-full border border-fg/15 px-3 py-1.5 font-mono text-xs hover:border-accent hover:text-accent sm:inline-block">
                {t('resume.openTab')} ↗
              </a>
              <a href={contact.cv} download className="rounded-full border border-fg/15 px-3 py-1.5 font-mono text-xs hover:border-accent hover:text-accent">
                {t('resume.download')}
              </a>
              <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full bg-fg/10 hover:bg-accent hover:text-bg" aria-label={t('resume.close')}>
                ✕
              </button>
            </div>
          </div>
          {/* Image HD du CV (s'affiche partout, y compris sur mobile, contrairement à un PDF intégré) */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto bg-[#e9eef0] p-3 sm:p-6">
            {open && <img src={contact.cvFull} alt={t('resume.dialogTitle')} width={1588} height={2246} className="mx-auto block w-full max-w-[820px] rounded-lg shadow-2xl" />}
          </div>
        </div>
      </dialog>
    </section>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  )
}
