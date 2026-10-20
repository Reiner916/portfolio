import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { useI18n } from '../../i18n/I18nProvider'
import { SHARED_DPR } from '../../lib/backgroundShader'
import { markSceneReady, onIntroStart } from '../../lib/loading'
import { gsap, lenis, ScrollTrigger } from '../../lib/motion'
import { CameraRig } from './scene/CameraRig'
import { FOV } from './scene/layout'
import { Screen } from './scene/Screen'
import { Setup } from './scene/Setup'

RectAreaLightUniformsLib.init()

// Distances de scroll, en hauteurs d'écran :
// BACK_VH pour reculer (au-dessus du point de départ), DIVE_VH pour la plongée (même valeur que la référence : +=250%).
const BACK_VH = 1
const DIVE_VH = 2.5
const BACK = BACK_VH / (BACK_VH + DIVE_VH)

export function Intro() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const overlay = useRef(1)
  const [active, setActive] = useState(true)

  useLayoutEffect(() => {
    let unsubscribe = () => {}
    const ctx = gsap.context(() => {
      const state = { p: 0 }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // même lissage que la référence
        },
      })
      tl.to(
        state,
        {
          p: 1,
          duration: 1,
          onUpdate: () => {
            progress.current = state.p
            // On coupe le rendu 3D une fois l'écran traversé
            setActive(state.p < 0.999)
          },
        },
        0,
      )
      tl.to(hintRef.current, { autoAlpha: 0, duration: 0.04 }, BACK + 0.01)
      tl.to(canvasWrapRef.current, { autoAlpha: 0, duration: 0.05 }, 0.95)

      // Quand le preloader se retire, on saute au point "devant l'écran" (on peut ensuite remonter pour reculer).
      // Le scrub fait arriver la caméra en douceur depuis la vue large.
      const st = tl.scrollTrigger!
      ScrollTrigger.refresh()
      unsubscribe = onIntroStart(() => {
        const startY = st.start + (st.end - st.start) * BACK
        lenis.resize()
        lenis.scrollTo(startY, { immediate: true, force: true })
      })
    }, sectionRef)
    return () => {
      unsubscribe()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative"
      style={{ height: `${(BACK_VH + DIVE_VH + 1) * 100}svh` }}
      aria-label={t('intro.name')}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div ref={canvasWrapRef} className="absolute inset-0">
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
        </div>

        {/* Indication de scroll : pastille bien visible en bas, au-dessus du décor */}
        <div ref={hintRef} className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-5 sm:bottom-10">
          <div className="flex items-center gap-4 rounded-2xl border border-accent/40 bg-bg/75 py-3 pr-6 pl-4 shadow-[0_0_40px_-10px_var(--c-accent)] backdrop-blur-md">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-accent text-bg" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" style={{ animationDuration: '2s' }} />
              <svg viewBox="0 0 24 24" className="relative size-5" style={{ animation: 'hint-bounce 1.6s ease-in-out infinite' }}>
                <path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flex flex-col gap-0.5 text-left">
              <span className="font-display text-base font-semibold text-fg sm:text-lg">{t('intro.hintDown')}</span>
              <span className="font-mono text-xs text-muted">↑ {t('intro.hintUp')}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
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
