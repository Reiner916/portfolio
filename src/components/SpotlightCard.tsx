import { useRef, type HTMLAttributes, type PointerEvent } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

type Props = HTMLAttributes<HTMLDivElement> & { tilt?: boolean }

// Carte avec un halo lumineux qui suit la souris (inspiré de SpotlightCard, React Bits),
// et en option une légère inclinaison 3D vers le curseur (TiltedCard).
export function SpotlightCard({ className = '', children, tilt = false, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = (e: PointerEvent) => {
    const el = ref.current!
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    if (tilt && !prefersReducedMotion) {
      gsap.to(el, {
        rotationY: (x / rect.width - 0.5) * 10,
        rotationX: -(y / rect.height - 0.5) * 10,
        transformPerspective: 900,
        duration: 0.5,
        ease: 'power3.out',
      })
    }
  }

  const onPointerLeave = () => {
    if (tilt) gsap.to(ref.current, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`group relative overflow-hidden rounded-3xl border border-fg/10 bg-surface/60 p-6 backdrop-blur-md transition-colors duration-300 hover:border-accent/40 sm:p-8 ${className}`}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx) var(--my), color-mix(in oklab, var(--c-accent) 14%, transparent), transparent 70%)' }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  )
}
