import { forwardRef, type ReactNode, type Ref } from 'react'
import { useI18n } from '../../../i18n/I18nProvider'

// Scène 2.5D du setup, en coordonnées SVG (viewBox 1600 × 1000).
// L'écran est un TROU dans le décor : on voit à travers le fond animé du site (comme le hublot de JeskoJets).
// Couches séparées pour la parallaxe : back (mur, déco), desk (bureau + écran), front (clavier, souris, tasse), screen (texte à l'écran).

export const SCREEN = { x: 530, y: 348, w: 540, h: 304 }
export const SCREEN_CENTER = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 }
export const BEZEL = { x: 516, y: 334, w: 568, h: 332 }

const mix = (a: string, b: string, pct: number) => `color-mix(in oklab, var(${a}) ${100 - pct}%, ${b.startsWith('--') ? `var(${b})` : b} ${pct}%)`

const tone = {
  floor: mix('--c-bg', 'black', 35),
  deskTop: mix('--c-surface', '--c-fg', 9),
  deskFront: mix('--c-surface', 'black', 30),
  dark: mix('--c-bg', 'black', 45),
  object: mix('--c-surface', '--c-fg', 14),
  objectLight: mix('--c-surface', '--c-fg', 24),
  plant: mix('--c-accent', 'black', 55),
  plantLight: mix('--c-accent', 'black', 35),
}

const fill = (color: string) => ({ fill: color })

export type SetupSceneRefs = {
  world: Ref<SVGGElement>
  back: Ref<SVGGElement>
  front: Ref<SVGGElement>
  screenDim: Ref<SVGGElement>
  screenText: Ref<SVGGElement>
}

const BOOKS = [
  { w: 24, h: 104, c: 'object' },
  { w: 30, h: 122, c: 'accent' },
  { w: 22, h: 96, c: 'objectLight' },
  { w: 34, h: 116, c: 'accent2' },
  { w: 26, h: 88, c: 'object' },
  { w: 20, h: 110, c: 'objectLight' },
] as const

const CODE_LINES = [
  [0, 70, 'accent'],
  [20, 120, 'muted'],
  [20, 90, 'accent2'],
  [40, 140, 'muted'],
  [40, 60, 'accent'],
  [20, 100, 'muted'],
  [0, 50, 'accent2'],
  [0, 130, 'muted'],
  [20, 80, 'accent'],
] as const

function bookColor(c: (typeof BOOKS)[number]['c']) {
  if (c === 'accent') return mix('--c-accent', 'black', 45)
  if (c === 'accent2') return mix('--c-accent-2', 'black', 50)
  return tone[c]
}

function codeColor(c: (typeof CODE_LINES)[number][2]) {
  if (c === 'accent') return 'var(--c-accent)'
  if (c === 'accent2') return 'var(--c-accent-2)'
  return 'var(--c-muted)'
}

// Touches du clavier, avec un léger élargissement vers l'avant (perspective).
function keyboardKeys() {
  const keys: { x: number; y: number; w: number }[] = []
  for (let row = 0; row < 4; row++) {
    const y = 815 + row * 11
    const left = 595 - row * 4
    const right = 1005 + row * 4
    const count = 15
    const gap = 3
    const w = (right - left - gap * (count - 1)) / count
    for (let i = 0; i < count; i++) {
      // Barre d'espace sur la dernière rangée
      if (row === 3 && i > 4 && i < 10) {
        if (i === 5) keys.push({ x: left + i * (w + gap), y, w: w * 5 + gap * 4 })
        continue
      }
      keys.push({ x: left + i * (w + gap), y, w })
    }
  }
  return keys
}

const KEYS = keyboardKeys()

export const SetupScene = forwardRef<SVGSVGElement, { refs: SetupSceneRefs }>(function SetupScene({ refs }, ref) {
  const { t } = useI18n()

  return (
    <svg
      ref={ref}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        {/* Le décor entier est masqué par ce trou à l'emplacement de l'écran */}
        <mask id="screen-hole" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="9600" height="10000">
          <rect x="-4000" y="-4000" width="9600" height="10000" fill="white" />
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="8" fill="black" />
        </mask>
        <clipPath id="screen-clip">
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="8" />
        </clipPath>
        <linearGradient id="wall" x1="0" y1="-200" x2="0" y2="1180" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: mix('--c-surface', 'black', 25) }} />
          <stop offset="1" style={{ stopColor: 'var(--c-surface)' }} />
        </linearGradient>
        <radialGradient id="led-glow">
          <stop offset="0" style={{ stopColor: 'var(--c-accent)', stopOpacity: 0.32 }} />
          <stop offset="0.55" style={{ stopColor: 'var(--c-accent-2)', stopOpacity: 0.1 }} />
          <stop offset="1" style={{ stopColor: 'var(--c-accent-2)', stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="lamp-glow">
          <stop offset="0" style={{ stopColor: 'var(--c-accent-2)', stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: 'var(--c-accent-2)', stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="kb-glow">
          <stop offset="0" style={{ stopColor: 'var(--c-accent)', stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: 'var(--c-accent)', stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.09" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.02" />
          <stop offset="0.46" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g ref={refs.world}>
        <g mask="url(#screen-hole)">
          {/* ===== Couche arrière : mur et déco ===== */}
          <g ref={refs.back}>
            <rect x="-4000" y="-4000" width="9600" height="5180" fill="url(#wall)" />
            <rect x="-4000" y="1180" width="9600" height="5000" style={fill(tone.floor)} />
            <rect x="-4000" y="1172" width="9600" height="8" style={fill(tone.deskFront)} />
            <ellipse cx="800" cy="500" rx="620" ry="380" fill="url(#led-glow)" />

            {/* Étagère + livres */}
            <rect x="130" y="330" width="350" height="12" rx="3" style={fill(tone.object)} />
            {BOOKS.reduce<{ x: number; els: ReactNode[] }>(
              (acc, b, i) => {
                acc.els.push(
                  <rect key={i} x={acc.x} y={330 - b.h} width={b.w} height={b.h} rx="3" style={fill(bookColor(b.c))} />,
                )
                acc.x += b.w + 4
                return acc
              },
              { x: 160, els: [] },
            ).els}
            <rect x="350" y="250" width="26" height="80" rx="3" transform="rotate(-14 376 330)" style={fill(tone.objectLight)} />
            <path d="M412 330 h50 l-6 -42 h-38 z" style={fill(tone.object)} />
            <ellipse cx="437" cy="270" rx="16" ry="26" style={fill(tone.plant)} />
            <ellipse cx="425" cy="276" rx="9" ry="20" transform="rotate(-25 425 276)" style={fill(tone.plantLight)} />

            {/* Cadre "code" */}
            <rect x="1170" y="160" width="270" height="270" rx="16" style={fill(tone.dark)} />
            <rect x="1170" y="160" width="270" height="270" rx="16" fill="none" style={{ stroke: tone.objectLight }} strokeWidth="2" />
            {CODE_LINES.map(([indent, w, c], i) => (
              <rect key={i} x={1200 + indent} y={192 + i * 24} width={w} height="10" rx="5" style={{ fill: codeColor(c), opacity: 0.75 }} />
            ))}
          </g>

          {/* ===== Couche bureau : lampe, plante, écran ===== */}
          <g>
            <polygon points="150,770 1450,770 1560,885 40,885" style={fill(tone.deskTop)} />
            <rect x="40" y="885" width="1520" height="27" rx="4" style={fill(tone.deskFront)} />
            <rect x="90" y="912" width="30" height="270" style={fill(tone.deskFront)} />
            <rect x="1480" y="912" width="30" height="270" style={fill(tone.deskFront)} />

            {/* Lampe */}
            <ellipse cx="300" cy="640" rx="180" ry="150" fill="url(#lamp-glow)" />
            <ellipse cx="270" cy="800" rx="52" ry="10" style={fill(tone.dark)} />
            <path d="M270 796 L232 630 L330 548" fill="none" style={{ stroke: tone.objectLight }} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="232" cy="630" r="9" style={fill(tone.object)} />
            <path d="M300 520 l70 30 l-24 44 l-70 -30 z" style={fill(tone.objectLight)} />

            {/* Plante */}
            <ellipse cx="1290" cy="660" rx="22" ry="62" transform="rotate(-24 1290 660)" style={fill(tone.plant)} />
            <ellipse cx="1372" cy="650" rx="22" ry="66" transform="rotate(22 1372 650)" style={fill(tone.plant)} />
            <ellipse cx="1330" cy="630" rx="20" ry="74" style={fill(tone.plantLight)} />
            <ellipse cx="1305" cy="690" rx="14" ry="40" transform="rotate(-50 1305 690)" style={fill(tone.plantLight)} />
            <path d="M1290 715 h80 l-10 80 h-60 z" style={fill(tone.object)} />

            {/* Écran : cadre, pied */}
            <rect x="776" y="660" width="48" height="112" style={fill(tone.object)} />
            <ellipse cx="800" cy="776" rx="118" ry="12" style={fill(tone.objectLight)} />
            <rect x={BEZEL.x} y={BEZEL.y} width={BEZEL.w} height={BEZEL.h} rx="18" style={fill(tone.dark)} />
            <rect x={BEZEL.x} y={BEZEL.y} width={BEZEL.w} height={BEZEL.h} rx="18" fill="none" style={{ stroke: tone.object }} strokeWidth="2" />
            <circle cx={BEZEL.x + BEZEL.w - 22} cy={BEZEL.y + BEZEL.h - 7} r="2.5" style={fill('var(--c-accent)')} />
          </g>
        </g>

        {/* ===== Contenu affiché à l'écran (par-dessus le trou) ===== */}
        <g clipPath="url(#screen-clip)">
          <g ref={refs.screenDim}>
            <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} style={{ fill: 'var(--c-bg)', opacity: 0.5 }} />
            <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="url(#glass)" />
          </g>
          <g ref={refs.screenText}>
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={SCREEN.x + 22 + i * 16} cy={SCREEN.y + 20} r="5" style={fill(tone.objectLight)} />
            ))}
            <text x={SCREEN.x + 34} y={SCREEN.y + 86} style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fill: 'var(--c-accent)' }}>
              $ {t('intro.prompt')}
            </text>
            <text x={SCREEN.x + 32} y={SCREEN.y + 146} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 50, fill: 'var(--c-fg)', letterSpacing: '-0.02em' }}>
              {t('intro.name')}
            </text>
            <text x={SCREEN.x + 34} y={SCREEN.y + 180} style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fill: 'var(--c-fg)', opacity: 0.75 }}>
              {t('intro.role')}
            </text>
            <text x={SCREEN.x + 34} y={SCREEN.y + 262} style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fill: 'var(--c-accent-2)' }}>
              $ {t('intro.command')}
              <tspan style={{ animation: 'blink 1s steps(1) infinite', fill: 'var(--c-fg)' }}> ▍</tspan>
            </text>
          </g>
        </g>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="8" fill="none" style={{ stroke: 'var(--c-accent)', opacity: 0.25 }} strokeWidth="1.5" />

        {/* ===== Couche avant : clavier, souris, tasse ===== */}
        <g ref={refs.front}>
          <ellipse cx="800" cy="842" rx="300" ry="34" fill="url(#kb-glow)" />
          <path d="M585 806 H1015 L1031 862 H569 Z" strokeLinejoin="round" strokeWidth="8" style={{ fill: tone.dark, stroke: tone.dark }} />
          {KEYS.map((k, i) => (
            <rect key={i} x={k.x} y={k.y} width={k.w} height="7.5" rx="2" style={fill(tone.object)} />
          ))}
          <rect x="1060" y="812" width="230" height="58" rx="14" style={fill(tone.dark)} />
          <ellipse cx="1170" cy="838" rx="22" ry="15" style={fill(tone.objectLight)} />
          <line x1="1170" y1="825" x2="1170" y2="834" style={{ stroke: 'var(--c-accent)' }} strokeWidth="2" strokeLinecap="round" />
          <rect x="398" y="796" width="52" height="62" rx="8" style={fill(tone.objectLight)} />
          <path d="M450 810 q22 0 22 18 q0 18 -22 18" fill="none" style={{ stroke: tone.objectLight }} strokeWidth="8" />
          <ellipse cx="424" cy="798" rx="26" ry="5" style={fill(tone.dark)} />
        </g>
      </g>
    </svg>
  )
})
