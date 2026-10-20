import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { BEZEL, FOV, MONITOR, SCREEN, SCREEN_CENTER } from './layout'

// Caméra pilotée par la progression du scroll (0 → 1) :
//  [0 → back]  vue large du setup → cadrage de départ (l'écran remplit le cadre)
//  [back → 1]  plongée dans l'écran, même courbe que la référence (zoom ×N, power2.in)
export function CameraRig({ progress, back, overlay }: { progress: RefObject<number>; back: number; overlay: RefObject<number> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  const target = useRef(new THREE.Vector3())
  const tmp = useRef({ far: new THREE.Vector3(), farTarget: new THREE.Vector3(), start: new THREE.Vector3(), center: new THREE.Vector3() })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    const p = progress.current ?? 0
    const aspect = size.width / size.height
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))

    // Distance de départ : l'écran occupe ~74 % de la largeur ou ~66 % de la hauteur (cadrage validé)
    const dStart = Math.max(MONITOR.h / (0.66 * 2 * tan), MONITOR.w / (0.74 * 2 * tan * aspect))
    // Distance finale : la dalle recouvre tout le cadre
    const dEnd = Math.min(SCREEN.h / (2 * tan), SCREEN.w / (2 * tan * aspect)) * 0.8
    // Vue large : on voit tout le bureau (on recule plus en portrait)
    const dFar = Math.max(3.1, 1.05 / (tan * aspect))

    const { far, farTarget, start, center } = tmp.current
    center.set(SCREEN_CENTER.x, SCREEN_CENTER.y, SCREEN_CENTER.z)
    start.set(center.x, center.y, center.z + dStart + BEZEL.depth)
    far.set(0.35, 1.5, center.z + dFar)
    farTarget.set(0, 1.0, center.z)

    // Petit mouvement de tête qui suit la souris (amorti), coupé pendant la plongée
    const ptr = pointer.current
    const damp = 1 - Math.exp(-delta * 3)
    ptr.sx += (ptr.x - ptr.sx) * damp
    ptr.sy += (ptr.y - ptr.sy) * damp

    if (p <= back) {
      const a = p / back
      const e = a * a * (3 - 2 * a)
      camera.position.lerpVectors(far, start, e)
      target.current.lerpVectors(farTarget, center, e)
      overlay.current = 1
    } else {
      const b = (p - back) / (1 - back)
      const e = b * b
      // Comme la référence : on "scale" la vue, la distance diminue en 1/scale
      const maxScale = dStart / dEnd
      const scale = 1 + (maxScale - 1) * e
      camera.position.set(center.x, center.y, center.z + dStart / scale + 0.001)
      target.current.copy(center)
      overlay.current = 1 - THREE.MathUtils.smoothstep(b, 0.3, 0.75)
    }

    const sway = 1 - THREE.MathUtils.smoothstep(p, back, back + (1 - back) * 0.3)
    camera.position.x += ptr.sx * 0.04 * sway
    camera.position.y -= ptr.sy * 0.025 * sway
    camera.lookAt(target.current)
  })

  return null
}
