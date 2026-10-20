import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

// Titre de section :
//  - remplissage de bas en haut (Capsule, "choose-title-clip") : copie claire en clip-path inset(100% 0 0) → inset(0%), scrub
//  - sur-titre qui monte (Capsule : yPercent 100 + opacity 0, ease "power1.inOut")
//  - trait dessiné sous le titre (Truus : strokeDashoffset → 0, 1.2 s, "power3.out", "play none none reverse" à "top 70%")
export function SectionTitle({ eyebrow, title, className = '' }: { eyebrow: string; title: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'bottom 45%', scrub: true } })
        .from('[data-eyebrow]', { yPercent: 100, opacity: 0, ease: 'power1.inOut' })
        .to('[data-title-clip]', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, '<')

      const path = ref.current!.querySelector<SVGPathElement>('[data-underline]')!
      const length = path.getTotalLength()
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%', toggleActions: 'play none none reverse' },
      })
    }, ref)
    return () => ctx.revert()
  }, [title])

  return (
    <div ref={ref} className={className}>
      <div className="overflow-hidden">
        <p data-eyebrow className="mb-6 font-mono text-sm text-accent">
          // {eyebrow}
        </p>
      </div>
      <h2 className="relative inline-block font-display text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl">
        <span className="text-fg/15">{title}</span>
        <span data-title-clip aria-hidden className="absolute inset-0 text-fg" style={{ clipPath: prefersReducedMotion ? 'none' : 'inset(100% 0 0 0)' }}>
          {title}
        </span>
        <svg viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute -bottom-3 left-0 h-3 w-[min(100%,22rem)] text-accent" aria-hidden>
          <path data-underline d="M3 9c40-6 80-7 120-4s90 6 120 1 40-6 54-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </h2>
    </div>
  )
}
