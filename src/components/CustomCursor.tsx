import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'

// Curseur personnalisé — mécanique reprise de Truus (valeurs identiques) :
//  - curseurs SVG différents selon ce qu'on survole (défaut / lien / texte), via CSS (voir index.css)
//  - une bulle qui suit la souris (quickTo 0.5 s, "power3", décalage +13 / -43 px, rotation -30°)
//    et qui apparaît avec un rebond élastique sur les éléments marqués data-bubble="texte".
export function CustomCursor() {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bubble = bubbleRef.current
    if (!bubble || window.matchMedia('(pointer: coarse)').matches) return

    const xTo = gsap.quickTo(bubble, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(bubble, 'y', { duration: 0.5, ease: 'power3' })
    let visible = false
    gsap.set(bubble, { rotation: -30 })

    const hide = () => {
      if (!visible) return
      visible = false
      gsap.killTweensOf(bubble, 'opacity,scale,rotation')
      gsap.to(bubble, { opacity: 1, scale: 0, rotation: -30, duration: 0.3, ease: 'sine.inOut' })
    }

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX + 13)
      yTo(e.clientY - 43)
    }

    const onOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest<HTMLElement>('[data-bubble]')
      if (target && !visible) {
        visible = true
        bubble.textContent = target.dataset.bubble ?? ''
        gsap.killTweensOf(bubble, 'opacity,scale,rotation')
        gsap.to(bubble, { opacity: 1, scale: 1, rotation: 0, duration: 1.7, delay: 0.1, ease: 'elastic.out(1, 0.4)' })
      } else if (target && visible) {
        bubble.textContent = target.dataset.bubble ?? ''
      } else if (!target) {
        hide()
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', hide)
    }
  }, [])

  return <div ref={bubbleRef} className="cursor-bubble" aria-hidden />
}
