import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, type RefObject } from 'react'
import * as THREE from 'three'
import { useI18n } from '../../../i18n/I18nProvider'
import { backgroundGlsl, cssColorVec3, sharedTime } from '../../../lib/backgroundShader'
import { SCREEN, SCREEN_CENTER } from './layout'

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// La dalle affiche le fond du site en coordonnées écran + un voile et le texte d'accueil par-dessus.
const FRAGMENT = /* glsl */ `
${backgroundGlsl}
uniform sampler2D uText;
uniform float uOverlay;
uniform vec2 uOffset;
varying vec2 vUv;
void main() {
  // uOffset compense le déplacement du canvas (quand la page défile), pour rester aligné sur le fond fixe du site
  vec3 col = siteBackground(gl_FragCoord.xy + uOffset);
  // Voile sombre + reflet de la vitre (disparaissent pendant la plongée)
  col = mix(col, uBg, 0.5 * uOverlay);
  float glare = smoothstep(0.62, 0.0, vUv.x + (1.0 - vUv.y) * 0.9) * 0.07;
  col += glare * uOverlay;
  vec4 text = texture2D(uText, vUv);
  col = mix(col, text.rgb, text.a * uOverlay);
  gl_FragColor = vec4(col, 1.0);
}
`

const TEXT_W = 2048
const TEXT_H = Math.round((TEXT_W * SCREEN.h) / SCREEN.w)

function drawText(canvas: HTMLCanvasElement, lines: { hello: string; name: string; role: string; status: string }) {
  const ctx = canvas.getContext('2d')!
  const css = getComputedStyle(document.documentElement)
  const fg = css.getPropertyValue('--c-fg').trim()
  const accent = css.getPropertyValue('--c-accent').trim()
  const accent2 = css.getPropertyValue('--c-accent-2').trim()
  const muted = css.getPropertyValue('--c-muted').trim()
  ctx.clearRect(0, 0, TEXT_W, TEXT_H)

  // Barre de fenêtre
  ctx.fillStyle = muted
  ctx.globalAlpha = 0.6
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(64 + i * 44, 62, 13, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const x = 128
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = accent
  ctx.font = '500 50px "JetBrains Mono"'
  ctx.fillText(`> ${lines.hello}`, x + 6, 330)

  ctx.fillStyle = fg
  ctx.font = '700 172px "Space Grotesk"'
  ctx.fillText(lines.name, x - 4, 520)

  ctx.globalAlpha = 0.78
  ctx.font = '400 60px "Inter"'
  ctx.fillText(lines.role, x + 4, 620)
  ctx.globalAlpha = 1

  ctx.fillStyle = accent2
  ctx.font = '500 44px "JetBrains Mono"'
  ctx.fillText(lines.status, x + 6, TEXT_H - 110)
}

export function Screen({ overlay }: { overlay: RefObject<number> }) {
  const { t, lang } = useI18n()
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const canvas = useThree((s) => s.gl.domElement)

  const textCanvas = useMemo(() => Object.assign(document.createElement('canvas'), { width: TEXT_W, height: TEXT_H }), [])
  const textTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(textCanvas)
    tex.colorSpace = THREE.NoColorSpace
    tex.anisotropy = 8
    return tex
  }, [textCanvas])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        toneMapped: false,
        uniforms: {
          uResolution: { value: new THREE.Vector2() },
          uTime: { value: 0 },
          uDpr: { value: 1 },
          uBg: { value: new THREE.Vector3(...cssColorVec3('--c-bg')) },
          uAccent: { value: new THREE.Vector3(...cssColorVec3('--c-accent')) },
          uAccent2: { value: new THREE.Vector3(...cssColorVec3('--c-accent-2')) },
          uText: { value: textTexture },
          uOverlay: { value: 1 },
          uOctaves: { value: 5 },
          uOffset: { value: new THREE.Vector2() },
        },
      }),
    [textTexture],
  )

  // Texte redessiné quand les polices sont prêtes et à chaque changement de langue
  useEffect(() => {
    let cancelled = false
    const lines = { hello: t('intro.hello'), name: t('intro.name'), role: t('intro.role'), status: t('intro.status') }
    Promise.all([
      document.fonts.load('700 172px "Space Grotesk"'),
      document.fonts.load('400 60px "Inter"'),
      document.fonts.load('500 50px "JetBrains Mono"'),
    ]).finally(() => {
      if (cancelled) return
      drawText(textCanvas, lines)
      textTexture.needsUpdate = true
    })
    return () => {
      cancelled = true
    }
  }, [t, lang, textCanvas, textTexture])

  useFrame(() => {
    const u = material.uniforms
    u.uTime.value = sharedTime()
    u.uDpr.value = dpr
    u.uResolution.value.set(size.width * dpr, size.height * dpr)
    // gl_FragCoord.y part du bas : si le canvas est remonté de T px, le fond fixe est décalé de -T
    const rect = canvas.getBoundingClientRect()
    u.uOffset.value.set(rect.left * dpr, (window.innerHeight - rect.bottom) * dpr)
    u.uOverlay.value = overlay.current ?? 1
  })

  return (
    <mesh position={[SCREEN_CENTER.x, SCREEN_CENTER.y, SCREEN_CENTER.z]} material={material}>
      <planeGeometry args={[SCREEN.w, SCREEN.h]} />
    </mesh>
  )
}
