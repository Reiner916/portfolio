import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { SHARED_DPR } from '../../lib/backgroundShader'
import { markSceneReady } from '../../lib/loading'
import { CameraRig } from './scene/CameraRig'
import { FOV } from './scene/layout'
import { Screen } from './scene/Screen'
import { Setup } from './scene/Setup'

// Scène 3D de l'intro, chargée à part (Three.js est lourd) pour que le reste du site s'affiche plus vite.
RectAreaLightUniformsLib.init()

type Props = { active: boolean; progress: RefObject<number>; overlay: RefObject<number>; back: number }

export default function IntroCanvas({ active, progress, overlay, back: BACK }: Props) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={SHARED_DPR}
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
