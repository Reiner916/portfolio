// Préférence d'animation : on suit le réglage du système (prefers-reduced-motion).
// Pour tester, on peut forcer depuis la console : localStorage.setItem('motion', 'full' | 'reduced') puis recharger.

const KEY = 'motion'
type Choice = 'full' | 'reduced'

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'full' || v === 'reduced' ? v : null
  } catch {
    return null
  }
}

export const systemPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const choice = readChoice()
export const reducedMotion = choice ? choice === 'reduced' : systemPrefersReduced

// Utilisé par le CSS (index.css) pour couper les animations CSS
document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full'
