// Défilé horizontal infini (inspiré de Marquee, Magic UI). Le contenu est doublé pour boucler sans saut.
export function Marquee({ items, reverse = false, duration = 40 }: { items: string[]; reverse?: boolean; duration?: number }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className="flex shrink-0 items-center gap-4 pr-4 group-hover:[animation-play-state:paused]"
          style={{ animation: `marquee ${duration}s linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {items.map((item) => (
            <span key={item} className="rounded-full border border-fg/10 bg-surface/50 px-5 py-2 font-mono text-sm whitespace-nowrap text-fg/80 backdrop-blur">
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
