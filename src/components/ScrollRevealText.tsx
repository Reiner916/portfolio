import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, SplitText } from '../lib/motion'

// Paragraphe qui s'éclaire ligne par ligne au scroll — technique et valeurs de Capsule (section "welcome") :
// chaque ligne a une copie claire superposée, masquée par clip-path: inset(0 0 100%),
// dévoilée jusqu'à inset(0% 0% 0% 0%) ; ease "none", stagger 0.2, duration 1, scrub, de "top 75%" à "bottom 75%".
export function ScrollRevealText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion || !ref.current) return
    let split: SplitText | null = null
    let cancelled = false
    // Découpage seulement une fois les polices chargées : sinon les lignes changent après coup (surtout sur mobile)
    // et certains mots passent à la ligne sans être couverts par la copie claire
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return
      split = SplitText.create(ref.current, {
        type: 'lines',
        linesClass: 'reveal-line',
        autoSplit: true, // re-découpe si la largeur change
        onSplit(self) {
          const clips = self.lines.map((line) => {
            const clip = document.createElement('span')
            clip.className = 'reveal-clip'
            clip.textContent = line.textContent
            line.appendChild(clip)
            return clip
          })
          return gsap
            .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'bottom 75%', scrub: true } })
            .to(clips, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', stagger: 0.2, duration: 1 })
        },
      })
    })
    return () => {
      cancelled = true
      split?.revert()
    }
  }, [text])

  // key={text} : le paragraphe est recréé quand le texte change (changement de langue),
  // sinon SplitText restaurerait l'ancien texte en se retirant
  return (
    <p key={text} ref={ref} className={className}>
      {text}
    </p>
  )
}
