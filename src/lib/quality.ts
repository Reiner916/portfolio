// Mode léger : quand la carte graphique est faible ou la connexion lente, l'intro remplace la 3D
// par une image HD de la scène (zoom 2.5D façon JeskoJets) et le fond animé tourne en basse résolution.
// Détection au chargement, puis bascule possible en cours de route si les images/s s'effondrent.

type NavigatorExtras = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string }
  deviceMemory?: number
}

function softwareGpu() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return true
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /swiftshader|llvmpipe|software|basic render/i.test(renderer)
  } catch {
    return true
  }
}

function detectLite() {
  const params = new URLSearchParams(window.location.search)
  if (params.has('lite')) return true // pour tester : ?lite
  if (params.has('full')) return false
  const nav = navigator as NavigatorExtras
  if (nav.connection?.saveData) return true
  if (['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType ?? '')) return true
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true
  return softwareGpu()
}

let lite = detectLite()
const listeners = new Set<(lite: boolean) => void>()
// Utilisé par le CSS (index.css) : en mode léger, plus de flous d'arrière-plan (très coûteux sans vraie carte graphique)
const flag = () => (document.documentElement.dataset.quality = lite ? 'lite' : 'full')
flag()

export const isLite = () => lite

export function goLite() {
  if (lite) return
  lite = true
  flag()
  listeners.forEach((fn) => fn(true))
}

export function onLiteChange(fn: (lite: boolean) => void) {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
