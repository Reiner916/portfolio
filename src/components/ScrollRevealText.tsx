import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

// Texte qui s'éclaire mot à mot au rythme du scroll (effet Capsule) : on lit au fur et à mesure qu'on descend.
export function ScrollRevealText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-word]',
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 50%', scrub: 1 },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [text])

  return (
    <p ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={i} aria-hidden>
          <span data-word className="inline-block">
            {word}
          </span>{' '}
        </span>
      ))}
    </p>
  )
}
