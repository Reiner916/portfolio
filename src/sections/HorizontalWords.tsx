import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion'

// Mots géants qui défilent à l'horizontale pendant que la section est épinglée.
// Code et valeurs repris de Truus ("horizontal-words") :
//  - timeline scrub 1, de "top bottom" à "+=" (hauteur fenêtre + 2500)
//  - la ligne entre par la droite (x: innerWidth → 0.5·innerWidth), puis défile jusqu'au bout (durée 2500)
//  - épinglage pendant 2500 px
//  - chaque lettre tombe en place : yPercent ±250, rotation ±30, "elastic.out(1.2, 1)", scrub 0.5, "left 90%" → "left 50%"
//  - les stickers font pareil avec scale 0 → 1, les flèches se dessinent
export function HorizontalWords() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const words = t('words.line')

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      const section = sectionRef.current!
      const row = rowRef.current!
      const n = window.innerHeight
      gsap.set(row, { yPercent: -50 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top bottom', end: () => `+=${n + 2500}`, scrub: 1, invalidateOnRefresh: true },
      })
      tl.fromTo(row, { x: window.innerWidth }, { x: 0.5 * window.innerWidth, ease: 'none', duration: n }).to(row, {
        x: () => -(row.scrollWidth - 0.5 * window.innerWidth),
        ease: 'none',
        duration: 2500,
      })

      ScrollTrigger.create({ trigger: section, start: 'top top', end: () => '+=2500', pin: true, pinSpacing: true, invalidateOnRefresh: true })

      section.querySelectorAll('[data-letter]').forEach((letter) => {
        gsap.from(letter, {
          yPercent: (Math.random() - 0.5) * 500,
          rotation: (Math.random() - 0.5) * 60,
          ease: 'elastic.out(1.2, 1)',
          scrollTrigger: { trigger: letter, containerAnimation: tl, start: 'left 90%', end: 'left 50%', scrub: 0.5 },
        })
      })
      section.querySelectorAll('[data-sticker]').forEach((sticker) => {
        gsap.from(sticker, {
          scale: 0,
          yPercent: (Math.random() - 0.5) * 400,
          rotation: (Math.random() - 0.5) * 60,
          ease: 'elastic.out(1.2, 1)',
          scrollTrigger: { trigger: sticker, containerAnimation: tl, start: 'left 90%', end: 'left 50%', scrub: 0.5 },
        })
      })
      section.querySelectorAll<SVGPathElement>('[data-draw]').forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1,
          scrollTrigger: { trigger: path.parentElement, containerAnimation: tl, start: 'left 90%', end: 'left 50%', scrub: 0.5 },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [words])

  return (
    <section ref={sectionRef} aria-label={words} className="relative z-10 h-screen overflow-hidden">
      <div ref={rowRef} className="absolute top-1/2 flex items-center px-[25vw] whitespace-nowrap">
        <div className="relative">
          {/* Flèche dessinée au-dessus du début de la phrase */}
          <svg viewBox="0 0 380 130" fill="none" className="absolute bottom-full left-0 w-[22vw] -translate-y-[10%] text-accent" aria-hidden>
            <path data-draw d="M4 120C30 40 110 10 170 40s40 90-10 80-30-90 60-100 140 40 150 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path data-draw d="M374 130l-6-24-20 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <h2 className="relative z-[2] font-display text-[9vw] leading-none font-bold tracking-tight text-fg lowercase" aria-hidden>
            {[...words].map((char, i) => (
              <span key={i} data-letter className="inline-block whitespace-pre">
                {char}
              </span>
            ))}
          </h2>

          {/* Stickers (dessinés pour le portfolio), placés comme chez Truus : 17.5 %, 50 %, 79 % */}
          <Sticker className="top-1/2 left-[17.5%] w-[6em] -translate-x-1/2 -translate-y-[110%] rotate-[-8deg]">
            <TerminalSticker />
          </Sticker>
          <Sticker className="top-1/2 left-1/2 w-[7.5em] -translate-x-1/2 translate-y-[10%] rotate-[6deg]">
            <WrenchSticker />
          </Sticker>
          <Sticker className="top-1/2 left-[79%] w-[8em] -translate-x-1/2 -translate-y-full rotate-[-4deg]">
            <KeySticker />
          </Sticker>

          <svg viewBox="0 0 140 127" fill="none" className="absolute top-1/2 left-full w-[8.4em] translate-x-1/2 text-accent-2" aria-hidden>
            <path data-draw d="M2 2c98 0 128 50 116 123" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path data-draw d="M100 108l18 17 20-15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-[12vh] px-5 text-center font-mono text-sm text-muted sm:text-base">{t('words.caption')}</p>
    </section>
  )
}

function Sticker({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={`absolute z-10 ${className}`} aria-hidden>
      <div data-sticker>{children}</div>
    </div>
  )
}

function TerminalSticker() {
  return (
    <svg viewBox="0 0 120 96" className="w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
      <rect x="4" y="4" width="112" height="88" rx="16" fill="var(--c-surface)" stroke="var(--c-accent)" strokeWidth="4" />
      <path d="M4 24h112" stroke="var(--c-accent)" strokeWidth="4" />
      <circle cx="18" cy="14" r="3.5" fill="var(--c-accent)" />
      <circle cx="30" cy="14" r="3.5" fill="var(--c-accent-2)" />
      <path d="M24 46l14 12-14 12" fill="none" stroke="var(--c-accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M48 72h28" stroke="var(--c-fg)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

function WrenchSticker() {
  return (
    <svg viewBox="0 0 120 120" className="w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
      <circle cx="60" cy="60" r="56" fill="var(--c-accent)" />
      <path
        d="M78 30a18 18 0 0 0-22 23L32 77a7 7 0 0 0 10 10l24-24a18 18 0 0 0 23-22l-11 11-9-2-2-9Z"
        fill="var(--c-bg)"
      />
    </svg>
  )
}

function KeySticker() {
  return (
    <svg viewBox="0 0 140 110" className="w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
      <rect x="6" y="14" width="128" height="90" rx="18" fill="#05080a" />
      <rect x="6" y="6" width="128" height="86" rx="18" fill="var(--c-surface)" stroke="var(--c-accent-2)" strokeWidth="4" />
      <text x="70" y="62" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="30" fontWeight="700" fill="var(--c-accent-2)">
        Ctrl
      </text>
    </svg>
  )
}
