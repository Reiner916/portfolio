import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { SHARED_DPR } from '../../lib/backgroundShader'
import { markSceneReady, onIntroStart } from '../../lib/loading'
import { goLite } from '../../lib/quality'
import { CameraRig } from './scene/CameraRig'
import { FOV } from './scene/layout'
import { Screen } from './scene/Screen'
import { Setup } from './scene/Setup'

// Scène 3D de l'intro, chargée à part (Three.js est lourd) pour que le reste du site s'affiche plus vite.
RectAreaLightUniformsLib.init()

type Props = { active: boolean; progress: RefObject<number>; overlay: RefObject<number>; back: number }

export default function IntroCanvas({ active, progress, overlay, back: BACK }: Props) {
  const [dpr, setDpr] = useState(SHARED_DPR)
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      shadows="soft"
      camera={{ fov: FOV, near: 0.005, far: 30, position: [0, 1.2, 3] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <color attach="background" args={['#070b0d']} />
      <fog attach="fog" args={['#070b0d', 3.5, 11]} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.2} color="#9fe6dc" position={[0, 2.5, 2]} scale={[4, 1, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#7cc8f0" position={[-3, 1.5, 0]} rotation-y={Math.PI / 2} scale={[3, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.4} color="#ffd9b0" position={[3, 1.5, 1]} rotation-y={-Math.PI / 2} scale={[2, 1, 1]} />
      </Environment>
      <Setup />
      <Screen overlay={overlay} />
      <CameraRig progress={progress} back={BACK} overlay={overlay} />
      <ReadySignal />
      <FpsGuard onSlow={() => setDpr(1)} />
    </Canvas>
  )
}

// Prévient le preloader une fois que la scène a rendu quelques images (shaders compilés, pas d'à-coup ensuite)
function ReadySignal() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 3) markSceneReady()
  })
  return null
}

// Surveille les images/s une fois l'intro lancée (fenêtres de 2 s, seulement quand la 3D est rendue) :
//  < 40 images/s → résolution réduite ; < 22 images/s deux fois de suite → mode léger (la 3D est retirée)
function FpsGuard({ onSlow }: { onSlow: () => void }) {
  const started = useRef(false)
  const stats = useRef({ frames: 0, time: 0, slowWindows: 0, reduced: false })
  useEffect(() => onIntroStart(() => void (started.current = true)), [])
  useFrame((_, delta) => {
    if (!started.current || delta > 0.5) return // on ignore les grosses pauses (onglet masqué, compilation)
    const s = stats.current
    s.frames += 1
    s.time += delta
    if (s.time < 2) return
    const fps = s.frames / s.time
    s.frames = 0
    s.time = 0
    if (fps < 40 && !s.reduced) {
      s.reduced = true
      onSlow()
    }
    s.slowWindows = fps < 22 ? s.slowWindows + 1 : 0
    if (s.slowWindows >= 2) goLite()
  })
  return null
}
