import type { ReactNode } from 'react'

// Stickers dessinés pour le portfolio (couleurs Lagon)

export function TerminalSticker() {
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

export function WrenchSticker() {
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

export function KeySticker() {
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

// Sticker texte (pastille arrondie façon autocollant)
export function TextSticker({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'accent2' | 'light' }) {
  const styles = {
    accent: 'bg-accent text-bg',
    accent2: 'bg-accent-2 text-bg',
    light: 'bg-fg text-bg',
  }[tone]
  return (
    <span className={`inline-block rounded-[1.2em_1.2em_1.2em_0.2em] px-4 py-2 font-display text-lg font-bold whitespace-nowrap shadow-[0_12px_24px_rgba(0,0,0,0.45)] ${styles}`}>
      {children}
    </span>
  )
}
