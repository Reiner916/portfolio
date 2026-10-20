import { RoundedBox } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three-stdlib'
import { BEZEL, DESK, MONITOR, SCREEN, SCREEN_CENTER, WALL_Z } from './layout'

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// ---------- Textures générées (pas de fichiers à charger) ----------

function woodTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 1024, height: 512 })
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#3b2a20'
  ctx.fillRect(0, 0, c.width, c.height)
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * c.height
    const amp = 2 + Math.random() * 6
    const freq = 0.004 + Math.random() * 0.01
    const phase = Math.random() * 10
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(20,12,8,0.35)' : 'rgba(120,85,60,0.18)'
    ctx.lineWidth = 0.5 + Math.random() * 2.5
    ctx.beginPath()
    for (let x = 0; x <= c.width; x += 8) ctx.lineTo(x, y + Math.sin(x * freq + phase) * amp)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function posterTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 512, height: 680 })
  const ctx = c.getContext('2d')!
  ctx.fillStyle = css('--c-bg')
  ctx.fillRect(0, 0, c.width, c.height)
  const colors = [css('--c-accent'), css('--c-muted'), css('--c-accent-2'), css('--c-muted')]
  const lines = [
    [0, 140], [40, 220], [40, 160], [80, 260], [80, 120], [40, 200], [0, 90], [0, 240],
    [40, 150], [80, 210], [80, 100], [40, 180], [0, 70], [0, 200], [40, 130],
  ]
  lines.forEach(([indent, w], i) => {
    ctx.fillStyle = colors[i % colors.length]
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.roundRect(56 + indent, 60 + i * 38, w, 14, 7)
    ctx.fill()
  })
  ctx.globalAlpha = 1
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function radialGlowTexture(color: string) {
  const c = Object.assign(document.createElement('canvas'), { width: 256, height: 256 })
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, color)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ---------- Matériaux ----------

function useMaterials() {
  return useMemo(() => {
    const accent = new THREE.Color(css('--c-accent'))
    const accent2 = new THREE.Color(css('--c-accent-2'))
    return {
      accent,
      accent2,
      wall: new THREE.MeshStandardMaterial({ color: '#1a2a30', roughness: 0.95 }),
      floor: new THREE.MeshStandardMaterial({ color: '#0b1114', roughness: 0.6, metalness: 0.1 }),
      wood: new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55, metalness: 0.02 }),
      blackMetal: new THREE.MeshStandardMaterial({ color: '#0d0f11', roughness: 0.38, metalness: 0.75 }),
      darkPlastic: new THREE.MeshStandardMaterial({ color: '#16191c', roughness: 0.55, metalness: 0.1 }),
      keycap: new THREE.MeshStandardMaterial({ color: '#22272b', roughness: 0.6 }),
      keycapAccent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.45, emissive: accent, emissiveIntensity: 0.25 }),
      fabric: new THREE.MeshStandardMaterial({ color: '#0f1417', roughness: 1 }),
      ceramic: new THREE.MeshPhysicalMaterial({ color: '#dfe8ea', roughness: 0.25, clearcoat: 0.6 }),
      coffee: new THREE.MeshStandardMaterial({ color: '#1e120b', roughness: 0.15 }),
      pot: new THREE.MeshStandardMaterial({ color: '#2a3236', roughness: 0.7 }),
      leaf: new THREE.MeshStandardMaterial({ color: '#1f6b52', roughness: 0.55, side: THREE.DoubleSide }),
      leafDark: new THREE.MeshStandardMaterial({ color: '#144a3a', roughness: 0.6, side: THREE.DoubleSide }),
      stem: new THREE.MeshStandardMaterial({ color: '#2d5a3f', roughness: 0.7 }),
      lampMetal: new THREE.MeshStandardMaterial({ color: '#c9d2d4', roughness: 0.3, metalness: 0.85 }),
      lampShade: new THREE.MeshStandardMaterial({ color: '#0d0f11', roughness: 0.38, metalness: 0.75, side: THREE.DoubleSide }),
      bulb: new THREE.MeshStandardMaterial({ color: '#fff3e0', emissive: '#ffd9a8', emissiveIntensity: 4 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#0b1216', roughness: 0.08, metalness: 0, transmission: 0, transparent: true, opacity: 0.55 }),
      emissiveAccent: new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 2.2, toneMapped: false }),
      emissiveAccent2: new THREE.MeshStandardMaterial({ color: accent2, emissive: accent2, emissiveIntensity: 1.8, toneMapped: false }),
      poster: new THREE.MeshStandardMaterial({ map: posterTexture(), roughness: 0.8 }),
      frame: new THREE.MeshStandardMaterial({ color: '#0a0d0f', roughness: 0.4, metalness: 0.5 }),
      books: ['#24414a', '#3a4a52', accent.clone().multiplyScalar(0.35), '#2b3338', accent2.clone().multiplyScalar(0.35), '#41505a'].map(
        (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
      ),
      wallGlow: new THREE.MeshBasicMaterial({
        map: radialGlowTexture(css('--c-accent')),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      deskGlow: new THREE.MeshBasicMaterial({
        map: radialGlowTexture(css('--c-accent')),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    }
  }, [])
}

type Materials = ReturnType<typeof useMaterials>

// ---------- Petits utilitaires ----------

const UP = new THREE.Vector3(0, 1, 0)

// Cylindre tendu entre deux points (bras de lampe, tiges…)
function Rod({ from, to, radius, material }: { from: THREE.Vector3Tuple; to: THREE.Vector3Tuple; radius: number; material: THREE.Material }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow>
      <cylinderGeometry args={[radius, radius, length, 16]} />
    </mesh>
  )
}

// ---------- Éléments ----------

function Room({ m }: { m: Materials }) {
  return (
    <group>
      <mesh position={[0, 1.5, WALL_Z]} material={m.wall} receiveShadow>
        <planeGeometry args={[14, 3]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 3]} material={m.floor} receiveShadow>
        <planeGeometry args={[14, 7]} />
      </mesh>
      {/* Plinthe */}
      <mesh position={[0, 0.04, WALL_Z + 0.006]} material={m.darkPlastic}>
        <boxGeometry args={[14, 0.08, 0.012]} />
      </mesh>
      {/* Halo de la bande LED derrière l'écran */}
      <mesh position={[0, SCREEN_CENTER.y, WALL_Z + 0.002]} material={m.wallGlow}>
        <planeGeometry args={[2.4, 1.5]} />
      </mesh>
    </group>
  )
}

function Desk({ m }: { m: Materials }) {
  const legX = DESK.w / 2 - 0.08
  return (
    <group>
      <RoundedBox
        args={[DESK.w, DESK.thickness, DESK.d]}
        radius={0.008}
        position={[0, DESK.y - DESK.thickness / 2, DESK.z]}
        material={m.wood}
        castShadow
        receiveShadow
      />
      {[-legX, legX].map((x) => (
        <group key={x} position={[x, 0, DESK.z]}>
          <mesh position={[0, (DESK.y - DESK.thickness) / 2, 0]} material={m.blackMetal} castShadow>
            <boxGeometry args={[0.06, DESK.y - DESK.thickness, 0.06]} />
          </mesh>
          <mesh position={[0, 0.015, 0]} material={m.blackMetal}>
            <boxGeometry args={[0.07, 0.03, DESK.d - 0.08]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, DESK.y - DESK.thickness - 0.04, DESK.z - DESK.d / 2 + 0.06]} material={m.blackMetal}>
        <boxGeometry args={[DESK.w - 0.2, 0.06, 0.03]} />
      </mesh>
      {/* Tapis de bureau */}
      <RoundedBox args={[0.92, 0.003, 0.38]} radius={0.0015} position={[0.08, DESK.y + 0.0015, 0.1]} material={m.fabric} receiveShadow />
    </group>
  )
}

function Monitor({ m }: { m: Materials }) {
  const bottom = SCREEN_CENTER.y - SCREEN.h / 2 - BEZEL.bottom
  const centerY = bottom + MONITOR.h / 2
  return (
    <group>
      <RoundedBox args={[MONITOR.w, MONITOR.h, BEZEL.depth]} radius={0.006} position={[0, centerY, MONITOR.z]} material={m.blackMetal} castShadow />
      {/* Coque arrière */}
      <RoundedBox args={[0.4, 0.24, 0.035]} radius={0.012} position={[0, centerY, MONITOR.z - 0.025]} material={m.darkPlastic} castShadow />
      {/* LED du bouton */}
      <mesh position={[MONITOR.w / 2 - 0.03, bottom + 0.006, MONITOR.z + BEZEL.depth / 2 + 0.0003]} material={m.emissiveAccent}>
        <circleGeometry args={[0.0018, 12]} />
      </mesh>
      {/* Pied */}
      <RoundedBox args={[0.055, centerY - DESK.y, 0.018]} radius={0.006} position={[0, DESK.y + (centerY - DESK.y) / 2, MONITOR.z - 0.05]} material={m.lampMetal} castShadow />
      <RoundedBox args={[0.26, 0.01, 0.19]} radius={0.004} position={[0, DESK.y + 0.005, MONITOR.z - 0.03]} material={m.lampMetal} castShadow receiveShadow />
      {/* Bande LED derrière l'écran */}
      <mesh position={[0, centerY, MONITOR.z - 0.046]} material={m.emissiveAccent}>
        <boxGeometry args={[0.36, 0.2, 0.002]} />
      </mesh>
    </group>
  )
}

const KEY = { size: 0.0175, pitch: 0.0205, height: 0.009 }
const KB = { x: -0.02, z: 0.1, w: 0.36, d: 0.125, h: 0.02 }

function Keyboard({ m }: { m: Materials }) {
  const instRef = useRef<THREE.InstancedMesh>(null)
  const keyGeo = useMemo(() => new RoundedBoxGeometry(KEY.size, KEY.height, KEY.size, 2, 0.0035), [])

  // Disposition 60 % : 5 rangées ; quelques touches en couleur d'accent (Échap, Entrée)
  const layout = useMemo(() => {
    const keys: { x: number; z: number; w: number; accent?: boolean }[] = []
    const rows = [15, 14, 13, 12]
    const left = -KB.w / 2 + 0.016
    rows.forEach((count, r) => {
      const total = KB.w - 0.032
      const extra = total - count * KEY.pitch
      for (let i = 0; i < count; i++) {
        const last = i === count - 1
        const w = last ? KEY.size + extra : KEY.size
        const x = left + i * KEY.pitch + w / 2
        keys.push({ x, z: -KB.d / 2 + 0.016 + r * KEY.pitch + KEY.size / 2, w, accent: (r === 0 && i === 0) || (r === 2 && last) })
      }
    })
    // Dernière rangée avec barre d'espace
    const z = -KB.d / 2 + 0.016 + 4 * KEY.pitch + KEY.size / 2
    const mods = [0, 1, 2, 10, 11, 12, 13]
    mods.forEach((slot) => keys.push({ x: left + slot * KEY.pitch * 1.0 + KEY.size / 2 + (slot > 2 ? 0.0 : 0), z, w: KEY.size }))
    keys.push({ x: left + 3 * KEY.pitch + (7 * KEY.pitch - (KEY.pitch - KEY.size)) / 2, z, w: 7 * KEY.pitch - (KEY.pitch - KEY.size) })
    return keys
  }, [])

  const regular = layout.filter((k) => !k.accent)
  const accents = layout.filter((k) => k.accent)

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    regular.forEach((k, i) => {
      dummy.position.set(k.x, 0, k.z)
      dummy.scale.set(k.w / KEY.size, 1, 1)
      dummy.updateMatrix()
      instRef.current!.setMatrixAt(i, dummy.matrix)
    })
    instRef.current!.instanceMatrix.needsUpdate = true
  }, [regular])

  return (
    <group position={[KB.x, DESK.y + KB.h / 2, KB.z]} rotation-x={0.04}>
      <mesh position={[0, -KB.h / 2 + 0.002, 0]} material={m.deskGlow} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[KB.w + 0.16, KB.d + 0.12]} />
      </mesh>
      <RoundedBox args={[KB.w, KB.h, KB.d]} radius={0.005} material={m.darkPlastic} castShadow receiveShadow />
      <group position={[0, KB.h / 2 + KEY.height / 2 - 0.002, 0]}>
        <instancedMesh ref={instRef} args={[keyGeo, m.keycap, regular.length]} castShadow />
        {accents.map((k, i) => (
          <mesh key={i} geometry={keyGeo} material={m.keycapAccent} position={[k.x, 0, k.z]} scale={[k.w / KEY.size, 1, 1]} />
        ))}
      </group>
    </group>
  )
}

function Mouse({ m }: { m: Materials }) {
  return (
    <group position={[0.33, DESK.y + 0.004, 0.11]} rotation-y={-0.08}>
      <mesh scale={[0.031, 0.019, 0.058]} position={[0, 0.012, 0]} material={m.darkPlastic} castShadow>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.031, -0.02]} material={m.emissiveAccent}>
        <boxGeometry args={[0.004, 0.003, 0.012]} />
      </mesh>
    </group>
  )
}

function Mug({ m }: { m: Materials }) {
  const profile = useMemo(
    () => [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.036, 0),
      new THREE.Vector2(0.04, 0.008),
      new THREE.Vector2(0.041, 0.095),
      new THREE.Vector2(0.037, 0.095),
      new THREE.Vector2(0.036, 0.012),
      new THREE.Vector2(0, 0.012),
    ],
    [],
  )
  return (
    <group position={[-0.44, DESK.y, 0.06]} rotation-y={0.6}>
      <mesh material={m.ceramic} castShadow>
        <latheGeometry args={[profile, 40]} />
      </mesh>
      <mesh position={[0, 0.078, 0]} rotation-x={-Math.PI / 2} material={m.coffee}>
        <circleGeometry args={[0.036, 32]} />
      </mesh>
      {/* Anse : demi-tore tourné sur le côté, ses deux extrémités rentrent dans la paroi */}
      <mesh position={[0.036, 0.05, 0]} rotation-z={-Math.PI / 2} material={m.ceramic} castShadow>
        <torusGeometry args={[0.024, 0.0065, 16, 32, Math.PI]} />
      </mesh>
    </group>
  )
}

// Profil de l'abat-jour (dôme fermé en haut, ouvert en bas, avec une épaisseur de bord)
const LAMP_SHADE = [
  new THREE.Vector2(0, 0.06),
  new THREE.Vector2(0.018, 0.058),
  new THREE.Vector2(0.03, 0.05),
  new THREE.Vector2(0.034, 0.035),
  new THREE.Vector2(0.06, -0.04),
  new THREE.Vector2(0.066, -0.055),
  new THREE.Vector2(0.062, -0.056),
  new THREE.Vector2(0.056, -0.042),
  new THREE.Vector2(0.03, 0.03),
  new THREE.Vector2(0.026, 0.044),
  new THREE.Vector2(0, 0.052),
]

function Lamp({ m }: { m: Materials }) {
  const base: THREE.Vector3Tuple = [-0.7, DESK.y + 0.02, -0.28]
  const elbow: THREE.Vector3Tuple = [-0.62, DESK.y + 0.42, -0.36]
  const head: THREE.Vector3Tuple = [-0.42, DESK.y + 0.5, -0.12]
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(-0.32, DESK.y, 0.05)
    return o
  }, [])
  return (
    <group>
      <mesh position={[base[0], DESK.y + 0.01, base[2]]} material={m.blackMetal} castShadow>
        <cylinderGeometry args={[0.07, 0.075, 0.02, 32]} />
      </mesh>
      <Rod from={base} to={elbow} radius={0.007} material={m.lampMetal} />
      <Rod from={elbow} to={head} radius={0.007} material={m.lampMetal} />
      <mesh position={elbow} material={m.blackMetal}>
        <sphereGeometry args={[0.014, 16, 16]} />
      </mesh>
      <group position={head} rotation={[0.9, 0, -0.35]}>
        <mesh material={m.lampShade} castShadow>
          <latheGeometry args={[LAMP_SHADE, 40]} />
        </mesh>
        {/* Rotule qui relie l'abat-jour au bras */}
        <mesh position={[0, 0.068, 0]} material={m.lampMetal}>
          <cylinderGeometry args={[0.012, 0.014, 0.02, 20]} />
        </mesh>
        <mesh position={[0, -0.03, 0]} material={m.bulb}>
          <sphereGeometry args={[0.022, 16, 16]} />
        </mesh>
      </group>
      <primitive object={target} />
      <spotLight
        position={head}
        target={target}
        angle={0.75}
        penumbra={0.8}
        intensity={3.2}
        distance={2.5}
        decay={2}
        color="#ffd2a1"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
    </group>
  )
}

function Plant({ m }: { m: Materials }) {
  const potProfile = useMemo(
    () => [new THREE.Vector2(0, 0), new THREE.Vector2(0.055, 0), new THREE.Vector2(0.075, 0.15), new THREE.Vector2(0.07, 0.15), new THREE.Vector2(0, 0.14)],
    [],
  )
  const leafGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.06, 0.04, 0.07, 0.14, 0, 0.2)
    s.bezierCurveTo(-0.07, 0.14, -0.06, 0.04, 0, 0)
    const g = new THREE.ShapeGeometry(s, 12)
    // Légère courbure de la feuille
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, -Math.abs(x) * 0.6 + y * y * 0.8)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2 + (i % 2) * 0.3
        const tilt = 0.5 + (i % 3) * 0.25
        const height = 0.18 + (i % 4) * 0.06
        return { angle, tilt, height, dark: i % 3 === 0 }
      }),
    [],
  )
  return (
    <group position={[0.68, DESK.y, -0.26]}>
      <mesh material={m.pot} castShadow receiveShadow>
        <latheGeometry args={[potProfile, 32]} />
      </mesh>
      {leaves.map((l, i) => {
        const tip: THREE.Vector3Tuple = [Math.sin(l.angle) * 0.06, 0.14 + l.height, Math.cos(l.angle) * 0.06]
        return (
          <group key={i}>
            <Rod from={[0, 0.13, 0]} to={tip} radius={0.003} material={m.stem} />
            <mesh
              geometry={leafGeo}
              material={l.dark ? m.leafDark : m.leaf}
              position={tip}
              rotation={[l.tilt, l.angle, 0, 'YXZ']}
              castShadow
            />
          </group>
        )
      })}
    </group>
  )
}

function Shelf({ m }: { m: Materials }) {
  const books = useMemo(() => {
    const widths = [0.028, 0.034, 0.024, 0.04, 0.03, 0.026, 0.036]
    const heights = [0.2, 0.23, 0.18, 0.22, 0.19, 0.24, 0.17]
    let x = -0.27
    return widths.map((w, i) => {
      const b = { x: x + w / 2, w, h: heights[i] }
      x += w + 0.004
      return b
    })
  }, [])
  const y = 1.58
  return (
    <group position={[-0.62, y, WALL_Z + 0.1]}>
      <RoundedBox args={[0.62, 0.022, 0.18]} radius={0.004} material={m.wood} castShadow receiveShadow />
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, 0.011 + b.h / 2, 0]} material={m.books[i % m.books.length]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.14]} />
        </mesh>
      ))}
      <mesh position={[0.06, 0.011 + 0.09, 0]} rotation-z={-0.25} material={m.books[2]} castShadow>
        <boxGeometry args={[0.028, 0.19, 0.14]} />
      </mesh>
      {/* Petite enceinte */}
      <RoundedBox args={[0.09, 0.14, 0.09]} radius={0.01} position={[0.22, 0.011 + 0.07, 0]} material={m.darkPlastic} castShadow />
      <mesh position={[0.22, 0.011 + 0.06, 0.0455]} material={m.blackMetal}>
        <circleGeometry args={[0.028, 24]} />
      </mesh>
    </group>
  )
}

function Poster({ m }: { m: Materials }) {
  return (
    <group position={[0.66, 1.62, WALL_Z + 0.012]}>
      <RoundedBox args={[0.36, 0.47, 0.02]} radius={0.004} material={m.frame} castShadow />
      <mesh position={[0, 0, 0.0105]} material={m.poster}>
        <planeGeometry args={[0.32, 0.43]} />
      </mesh>
    </group>
  )
}

function Tower({ m }: { m: Materials }) {
  const w = 0.22
  const h = 0.48
  const d = 0.45
  return (
    <group position={[1.12, 0, -0.18]} rotation-y={-0.35}>
      <RoundedBox args={[w, h, d]} radius={0.01} position={[0, h / 2 + 0.02, 0]} material={m.blackMetal} castShadow receiveShadow />
      {/* Ventilateurs en façade */}
      {[0.12, 0.26, 0.4].map((y) => (
        <mesh key={y} position={[0, y, d / 2 + 0.002]} material={m.emissiveAccent2}>
          <torusGeometry args={[0.055, 0.004, 8, 48]} />
        </mesh>
      ))}
      <mesh position={[0, h / 2 + 0.02, d / 2 + 0.004]} material={m.glass}>
        <planeGeometry args={[w - 0.02, h - 0.02]} />
      </mesh>
      <mesh position={[w / 2 - 0.012, h / 2 + 0.02, d / 2 + 0.005]} material={m.emissiveAccent}>
        <boxGeometry args={[0.004, h - 0.06, 0.002]} />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.01, 0]} material={m.darkPlastic}>
          <boxGeometry args={[0.03, 0.02, d - 0.04]} />
        </mesh>
      ))}
      <pointLight position={[0, 0.26, d / 2 + 0.12]} color={m.accent2} intensity={0.35} distance={0.9} decay={2} />
    </group>
  )
}

function Lights({ m }: { m: Materials }) {
  const rectRef = useRef<THREE.RectAreaLight>(null)
  useLayoutEffect(() => {
    rectRef.current?.lookAt(SCREEN_CENTER.x, SCREEN_CENTER.y - 0.2, SCREEN_CENTER.z + 1)
  }, [])
  return (
    <>
      <ambientLight intensity={0.12} color="#9fc6cf" />
      <hemisphereLight args={['#33515a', '#05080a', 0.45]} />
      {/* Lumière émise par l'écran */}
      <rectAreaLight
        ref={rectRef}
        position={[SCREEN_CENTER.x, SCREEN_CENTER.y, SCREEN_CENTER.z + 0.01]}
        width={SCREEN.w}
        height={SCREEN.h}
        intensity={3}
        color={m.accent}
      />
      {/* Halo LED sur le mur derrière l'écran */}
      <pointLight position={[0, SCREEN_CENTER.y, WALL_Z + 0.12]} color={m.accent} intensity={0.9} distance={1.6} decay={2} />
      {/* Contre-jour froid pour détacher les volumes */}
      <directionalLight position={[2.5, 3, 2]} intensity={0.35} color="#bcdfe8" />
    </>
  )
}

export function Setup() {
  const m = useMaterials()
  return (
    <group>
      <Lights m={m} />
      <Room m={m} />
      <Desk m={m} />
      <Monitor m={m} />
      <Keyboard m={m} />
      <Mouse m={m} />
      <Mug m={m} />
      <Lamp m={m} />
      <Plant m={m} />
      <Shelf m={m} />
      <Poster m={m} />
      <Tower m={m} />
    </group>
  )
}
