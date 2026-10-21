import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { KeySticker, TerminalSticker, TextSticker, WrenchSticker } from '../components/Stickers'
import { contact } from '../data/contact'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, lenis, prefersReducedMotion } from '../lib/motion'

// Rotations de base des stickers (Truus, pied de page)
const STICKER_ROTATIONS = [12, -10, 8, -12, 10, -8]

// Contact + pied de page.
//  - grand titre : lettres x -120 % → 0 %, stagger 0.02, "power3.out", scrub de "top 90%" à "top 80%" (Capsule, pied de page)
//  - stickers (Truus, pied de page) : apparition scale 0 → 1, rotation × 0.7, 0.7 s "back.out(1.7)", stagger 0.12 ;
//    ils fuient la souris dans un rayon de 180 px (déplacement max 55 px), puis reviennent en "elastic.out(1, 0.35)"
export function Contact() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  const title = t('contact.title')

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.set('[data-title-char]', { x: '-120%' })
      gsap.to('[data-title-char]', {
        x: '0%',
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 90%', end: 'top 80%', scrub: true },
      })
      gsap.from('[data-contact-reveal]', { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '[data-contact-list]', start: 'top 85%' } })

      const stickers = gsap.utils.toArray<HTMLElement>('[data-footer-sticker]')
      gsap.set(stickers, { scale: 0, opacity: 0, transformOrigin: 'center bottom' })
      stickers.forEach((s, i) => gsap.set(s, { rotation: STICKER_ROTATIONS[i % STICKER_ROTATIONS.length] }))
      gsap.to(stickers, {
        scale: 1,
        opacity: 1,
        rotation: (i) => 0.7 * STICKER_ROTATIONS[i % STICKER_ROTATIONS.length],
        duration: 0.7,
        ease: 'back.out(1.7)',
        stagger: 0.12,
        scrollTrigger: { trigger: '[data-footer-stickers]', start: 'top 92%', toggleActions: 'play none none reverse' },
      })

      const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v))
      const cleanups = stickers.map((sticker, i) => {
        const base = 0.7 * STICKER_ROTATIONS[i % STICKER_ROTATIONS.length]
        let lastX = 0
        let lastY = 0
        const onMove = (e: MouseEvent) => {
          const dx = e.clientX - lastX
          const dy = e.clientY - lastY
          lastX = e.clientX
          lastY = e.clientY
          const rect = sticker.getBoundingClientRect()
          const dist = Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2))
          const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
          if (!inside && dist < 180 && Math.hypot(dx, dy) > 3) {
            const force = 1 - dist / 180
            const x = clamp(4 * dx * force, 55)
            const y = clamp(4 * dy * force, 55)
            gsap.killTweensOf(sticker)
            gsap.to(sticker, { x, y, rotation: base + 0.25 * x, duration: 0.18, ease: 'power3.out' })
            gsap.to(sticker, { x: 0, y: 0, rotation: base, duration: 1.1, ease: 'elastic.out(1, 0.35)', delay: 0.18 })
          }
        }
        document.addEventListener('mousemove', onMove)
        return () => document.removeEventListener('mousemove', onMove)
      })
      return () => cleanups.forEach((off) => off())
    }, rootRef)
    return () => ctx.revert()
  }, [title])

  return (
    <section ref={rootRef} id="contact" className="relative z-10 overflow-hidden px-5 pt-32 pb-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 font-mono text-sm text-accent">// {t('contact.eyebrow')}</p>
        <h2 className="font-display text-[clamp(3rem,11vw,10rem)] leading-[0.9] font-bold tracking-tight" aria-label={title}>
          {title.split(' ').map((word, w) => (
            <span key={w} className="inline-block whitespace-nowrap">
              {[...word].map((char, i) => (
                <span key={i} className="inline-block overflow-clip" aria-hidden>
                  <span data-title-char className="inline-block">
                    {char}
                  </span>
                </span>
              ))}
              &nbsp;
            </span>
          ))}
        </h2>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-fg/75">{t('contact.text')}</p>

        {/* minmax(0, 1fr) : une colonne qui ne dépasse jamais l'écran, même avec une longue adresse e-mail */}
        <div data-contact-list className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
          <EmailCard />
          <ContactLink label={t('contact.phone')} value={contact.phone} href={contact.phoneHref} bubble={t('cursor.call')} icon={<PhoneIcon />} />
          <ContactLink label={t('contact.linkedin')} value="in/amir-chouchane" href={contact.linkedin} bubble="LinkedIn ↗" icon={<LinkedInIcon />} external />
          <ContactLink label={t('contact.github')} value="Reiner916" href={contact.github} bubble="GitHub ↗" icon={<GitHubIcon />} external />
        </div>

        {/* Stickers qui fuient la souris */}
        <div data-footer-stickers className="relative mt-24 flex flex-wrap items-end justify-center gap-6 sm:gap-10">
          <FooterSticker className="w-20">
            <TerminalSticker />
          </FooterSticker>
          <FooterSticker>
            <TextSticker>{t('contact.stickers.0')}</TextSticker>
          </FooterSticker>
          <FooterSticker className="w-16">
            <WrenchSticker />
          </FooterSticker>
          <FooterSticker>
            <TextSticker tone="accent2">{t('contact.stickers.1')}</TextSticker>
          </FooterSticker>
          <FooterSticker className="w-20">
            <KeySticker />
          </FooterSticker>
          <FooterSticker>
            <TextSticker tone="light">{t('contact.stickers.2')}</TextSticker>
          </FooterSticker>
        </div>

        <footer className="mt-24 flex flex-col items-center justify-between gap-4 border-t border-fg/10 pt-6 font-mono text-xs text-muted sm:flex-row">
          <span>{t('contact.footer')}</span>
          <span>{t('contact.stack')}</span>
          <button type="button" onClick={() => lenis.scrollTo(0, { duration: 2.5 })} data-bubble={t('cursor.home')} className="hover:text-accent">
            {t('contact.top')} ↑
          </button>
        </footer>
      </div>
    </section>
  )
}

function FooterSticker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div data-footer-sticker className={`will-change-transform ${className}`} aria-hidden>
      {children}
    </div>
  )
}

function EmailCard() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* presse-papiers indisponible : le lien mailto reste utilisable */
    }
  }
  return (
    <div data-contact-reveal className="group relative flex min-w-0 items-center gap-3 rounded-3xl border border-accent/40 bg-accent/10 p-5 backdrop-blur-md sm:gap-4 sm:p-8 md:col-span-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent text-bg sm:size-12">
        <MailIcon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs tracking-wider text-accent uppercase">{t('contact.email')}</p>
        <a href={`mailto:${contact.email}`} data-bubble={t('cursor.mail')} className="mt-1 block truncate font-display text-lg font-semibold text-fg hover:text-accent sm:text-4xl">
          {contact.email}
        </a>
      </div>
      <button
        type="button"
        onClick={copy}
        data-bubble={t('cursor.copy')}
        className="shrink-0 rounded-full border border-fg/20 px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? t('contact.copied') : t('contact.copy')}
      </button>
    </div>
  )
}

function ContactLink({ label, value, href, bubble, icon, external = false }: { label: string; value: string; href: string; bubble: string; icon: ReactNode; external?: boolean }) {
  return (
    <a
      data-contact-reveal
      href={href}
      data-bubble={bubble}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group flex min-w-0 items-center gap-4 rounded-3xl border border-fg/10 bg-surface/60 p-5 backdrop-blur-md transition-colors hover:border-accent/50 sm:p-6"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-fg/10 bg-bg/60 text-accent transition-colors group-hover:bg-accent group-hover:text-bg">{icon}</span>
      <span className="min-w-0">
        <span className="block font-mono text-xs tracking-wider text-muted uppercase">{label}</span>
        <span className="mt-1 block truncate font-display text-xl font-semibold text-fg">{value}</span>
      </span>
      <span aria-hidden className="ml-auto text-xl text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
        →
      </span>
    </a>
  )
}

const iconProps = { viewBox: '0 0 24 24', className: 'size-5', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
  )
}
function GitHubIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  )
}
