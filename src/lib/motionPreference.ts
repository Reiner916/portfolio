// Préférence d'animation : par défaut on suit le réglage du système (prefers-reduced-motion),
// mais le visiteur peut forcer "animations activées" ou "réduites" avec le bouton de la nav (mémorisé).

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

export function setMotion(full: boolean) {
  try {
    localStorage.setItem(KEY, full ? 'full' : 'reduced')
  } catch {
    /* stockage indisponible : le choix ne sera pas mémorisé */
  }
  window.location.reload()
}
