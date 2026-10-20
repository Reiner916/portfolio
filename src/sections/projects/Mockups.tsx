import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { cleanerTerminal } from '../../data/projects'
import { prefersReducedMotion } from '../../lib/motion'

// Maquettes animées affichées tant qu'il n'y a pas de vraie capture du projet.

function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

// Petite boucle qui avance tant que la maquette est visible
function useTicker(active: boolean, interval: number) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active || prefersReducedMotion) return
    const id = setInterval(() => setTick((n) => n + 1), interval)
    return () => clearInterval(id)
  }, [active, interval])
  return tick
}

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-fg/10 bg-bg shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 border-b border-fg/10 bg-surface px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-fg/20" />
          ))}
        </div>
        <div className="mx-auto flex h-6 w-1/2 items-center gap-2 rounded-md bg-bg/70 px-3">
          <svg viewBox="0 0 16 16" className="size-3 text-accent" aria-hidden>
            <path d="M4 7V5a4 4 0 0 1 8 0v2h1v7H3V7h1Zm2 0h4V5a2 2 0 0 0-4 0v2Z" fill="currentColor" />
          </svg>
          <span className="h-1.5 w-2/3 rounded-full bg-fg/15" />
        </div>
      </div>
      {children}
    </div>
  )
}

const CARD_COLORS = ['var(--c-accent)', 'var(--c-accent-2)', '#f5a524', '#c084fc', '#ff6b4a', '#7cc8f0']

export function DirectoryMock() {
  const { t } = useI18n()
  const [ref, inView] = useInView<HTMLDivElement>()
  const tick = useTicker(inView, 1400)
  const query = t('projects.mock.search')
  const categories = [0, 1, 2, 3, 4].map((i) => t(`projects.mock.categories.${i}`))
  const active = tick % categories.length
  const copied = tick % 6

  // Saisie animée dans la barre de recherche
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    if (!inView || prefersReducedMotion) return
    const id = setInterval(() => setTyped((n) => (n >= query.length + 12 ? 0 : n + 1)), 90)
    return () => clearInterval(id)
  }, [inView, query])

  return (
    <div ref={ref}>
      <BrowserFrame>
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-surface px-4 py-3">
            <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-accent" aria-hidden>
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m14 14 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-mono text-xs text-fg/80 sm:text-sm">
              {prefersReducedMotion ? query : query.slice(0, Math.min(typed, query.length))}
              <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-accent" style={{ animation: 'blink 1s steps(1) infinite' }} />
            </span>
          </div>

          <div className="mt-4 flex gap-2 overflow-hidden">
            {categories.map((c, i) => (
              <span
                key={c}
                className={`shrink-0 rounded-full px-3 py-1 font-mono text-[11px] transition-colors duration-500 ${
                  i === active ? 'bg-accent text-bg' : 'border border-fg/10 text-muted'
                }`}
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CARD_COLORS.map((color, i) => (
              <div key={i} className="rounded-xl border border-fg/10 bg-surface p-3">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-lg" style={{ background: color, opacity: 0.85 }} />
                  <span className="h-1.5 flex-1 rounded-full bg-fg/15" />
                </div>
                <span className="mt-3 block h-1.5 w-3/4 rounded-full bg-fg/10" />
                <div
                  className={`mt-3 flex items-center justify-between rounded-lg px-2 py-1.5 font-mono text-[10px] transition-colors duration-300 ${
                    copied === i ? 'bg-accent/20 text-accent' : 'bg-bg text-fg/60'
                  }`}
                >
                  <span>{copied === i ? '✓' : 'CODE••••'}</span>
                  <span className="h-2.5 w-2.5 rounded-sm border border-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    </div>
  )
}

// Vraies captures : la 1re dans une fenêtre de navigateur, la 2e en superposition décalée
export function Screenshots({ images, alt }: { images: string[]; alt: string }) {
  const [main, second] = images
  return (
    <div className="relative pb-[18%] sm:pr-[10%]">
      <BrowserFrame>
        <img src={main} alt={alt} loading="lazy" width={1600} height={900} className="block aspect-video w-full object-cover" />
      </BrowserFrame>
      {second && (
        <div data-shot-overlay className="absolute right-0 bottom-0 w-[62%] -rotate-2">
          <BrowserFrame>
            <img src={second} alt={alt} loading="lazy" width={1600} height={900} className="block aspect-video w-full object-cover" />
          </BrowserFrame>
        </div>
      )}
    </div>
  )
}

const TONE = { prompt: 'text-fg', command: 'text-fg/70', success: 'text-accent' } as const

export function TerminalMock() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const { file, lines } = cleanerTerminal
  const tick = useTicker(inView, 900)
  const step = prefersReducedMotion ? lines.length : tick % (lines.length + 3)
  const progress = Math.min(step, lines.length) / lines.length

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-fg/10 bg-[#05080a] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2 border-b border-fg/10 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-full bg-fg/20" />
        ))}
        <span className="ml-3 font-mono text-[11px] text-muted">C:\Windows\System32\cmd.exe</span>
      </div>
      <div className="min-h-64 p-5 font-mono text-xs leading-7 sm:text-sm">
        <p className="text-accent-2">C:\&gt; &quot;{file}&quot;</p>
        {lines.slice(0, step).map((line, i) => (
          <p key={i} className={TONE[line.tone]}>
            {line.tone === 'command' ? '  ' : ''}
            {line.text}
          </p>
        ))}
        {step < lines.length && <span className="inline-block h-4 w-2 translate-y-0.5 bg-fg/70" style={{ animation: 'blink 1s steps(1) infinite' }} />}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-fg/10">
          <div className="h-full origin-left rounded-full bg-accent transition-transform duration-700" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  )
}
