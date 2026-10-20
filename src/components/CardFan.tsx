import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion'

// Éventail de cartes — code et valeurs de Truus (section "call us if you need") :
//  ≥ 1349 px : cartes posées en éventail (left / top / rotation ci-dessous, 320 px de large) ;
//              au survol, la carte se redresse (y 50 - top, scale 1.08, 0.9 s "elastic.out(1, 0.5)")
//              et les autres s'écartent (±150 px par rang, y = x · tan(rotation)), retour "elastic.out(1, 0.5)" + 0.08 s
//  ≤ 768 px  : cartes empilées dans une section épinglée, chacune monte (y 1.1·vh → 0, "power3.out", scrub 0.4)
//  entre les deux : grille simple.
const CARD_W = 320
const LAYOUTS: Record<number, { left: number[]; top: number[]; rotation: number[] }> = {
  5: { left: [-650, -430, -220, 50, 320], top: [50, 100, 20, 30, 70], rotation: [4, -5, 5, -8, 5] },
  4: { left: [-540, -320, -110, 160], top: [50, 100, 20, 30], rotation: [4, -5, 5, -8] },
  3: { left: [-430, -160, 110], top: [60, 20, 80], rotation: [-5, 5, -8] },
}
const MOBILE_ROTATIONS = [-6, 4, -8, 5, -3]

export function CardFan({ items }: { items: { key: string; node: ReactNode }[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const layout = LAYOUTS[items.length] ?? LAYOUTS[5]

  useLayoutEffect(() => {
    if (prefersReducedMotion) return
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1349px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-fan-card]', wrapperRef.current)
      cards.forEach((card, i) => gsap.set(card, { rotation: layout.rotation[i], zIndex: i + 1 }))

      const onEnter = (index: number) => () => {
        const target = cards[index]
        const left = target.offsetLeft
        gsap.to(target, { x: 0, y: 50 - target.offsetTop, rotation: 0, scale: 1.08, duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: true })

        const after = cards.slice(index + 1)
        const afterStart = left + CARD_W + 120
        after.forEach((card, o) => {
          const i = index + 1 + o
          const x = Math.max(afterStart + 150 * o - card.offsetLeft, 10)
          gsap.to(card, { x, y: x * Math.tan((layout.rotation[i] * Math.PI) / 180), rotation: layout.rotation[i], scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)', overwrite: true })
        })

        const before = cards.slice(0, index).reverse()
        const beforeStart = left - 120 - CARD_W
        before.forEach((card, o) => {
          const i = index - 1 - o
          const x = Math.min(beforeStart - 150 * o - card.offsetLeft, -10)
          gsap.to(card, { x, y: x * Math.tan((layout.rotation[i] * Math.PI) / 180), rotation: layout.rotation[i], scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)', overwrite: true })
        })
      }
      const onLeave = () =>
        cards.forEach((card, i) =>
          gsap.to(card, { x: 0, y: 0, scale: 1, rotation: layout.rotation[i], duration: 1, ease: 'elastic.out(1, 0.5)', overwrite: true, zIndex: i + 1, delay: 0.08 }),
        )

      const handlers = cards.map((card, i) => {
        const enter = onEnter(i)
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', onLeave)
        return () => {
          card.removeEventListener('mouseenter', enter)
          card.removeEventListener('mouseleave', onLeave)
        }
      })
      return () => handlers.forEach((off) => off())
    })

    mm.add('(max-width: 768px)', () => {
      const wrapper = wrapperRef.current!
      const cards = gsap.utils.toArray<HTMLElement>('[data-fan-card]', wrapper)
      const step = 0.8 * window.innerHeight
      cards.forEach((card, i) =>
        gsap.set(card, {
          position: 'absolute',
          left: '50%',
          top: 0,
          xPercent: -50,
          y: i === 0 ? 0 : 1.1 * window.innerHeight,
          rotation: MOBILE_ROTATIONS[i % MOBILE_ROTATIONS.length],
          zIndex: i + 1,
          transformOrigin: 'center center',
        }),
      )
      gsap.set(wrapper, { height: 0.7 * window.innerHeight + step * (cards.length - 1) })
      ScrollTrigger.create({ trigger: wrapper, start: 'top 60px', end: `+=${step * (cards.length - 1)}`, pin: true, pinSpacing: true })
      cards.forEach((card, i) => {
        if (i === 0) return
        gsap.fromTo(
          card,
          { y: 1.1 * window.innerHeight },
          { y: 0, ease: 'power3.out', scrollTrigger: { trigger: wrapper, start: `top+=${(i - 1) * step} 60px`, end: `top+=${i * step} 60px`, scrub: 0.4 } },
        )
      })
    })

    return () => mm.revert()
  }, [items.length, layout])

  return (
    <div
      ref={wrapperRef}
      className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-[768px]:block min-[1349px]:left-1/2 min-[1349px]:block min-[1349px]:h-[600px] min-[1349px]:w-[1400px] min-[1349px]:-translate-x-1/2"
    >
      {items.map((item, i) => (
        <div
          key={item.key}
          data-fan-card
          className="max-[768px]:w-[82vw] max-[768px]:max-w-[340px] min-[1349px]:absolute min-[1349px]:h-[420px] min-[1349px]:w-[320px] min-[1349px]:left-(--fan-left) min-[1349px]:top-(--fan-top)"
          style={{ '--fan-left': `calc(50% + ${layout.left[i]}px)`, '--fan-top': `${layout.top[i]}px` } as CSSProperties}
        >
          {item.node}
        </div>
      ))}
    </div>
  )
}
