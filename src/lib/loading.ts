// Coordination entre le preloader et l'intro.

let resolveScene!: () => void
// Résolue quand la scène 3D a rendu ses premières images (shaders compilés)
export const sceneReady = new Promise<void>((resolve) => (resolveScene = resolve))
export const markSceneReady = () => resolveScene()

let introStarted = false
const listeners = new Set<() => void>()

// Appelé par le preloader quand il a fini de se retirer
export function startIntro() {
  introStarted = true
  listeners.forEach((fn) => fn())
}

export function onIntroStart(fn: () => void) {
  if (introStarted) fn()
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
