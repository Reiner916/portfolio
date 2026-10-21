import { useEffect, useRef } from 'react'
import { backgroundGlsl, cssColorVec3, sharedTime, SHARED_DPR } from '../lib/backgroundShader'
import { prefersReducedMotion } from '../lib/motion'
import { isLite, onLiteChange } from '../lib/quality'

const VERTEX = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`
// Haute précision si la puce la propose, sinon précision moyenne (au lieu d'un échec de compilation)
const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n${backgroundGlsl}\nvoid main() { gl_FragColor = vec4(siteBackground(gl_FragCoord.xy), 1.0); }`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader))
  return shader
}

// Fond animé fixe derrière tout le site (WebGL, un seul quad plein écran).
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const u = (name: string) => gl.getUniformLocation(program, name)
    gl.uniform3fv(u('uBg'), cssColorVec3('--c-bg'))
    gl.uniform3fv(u('uAccent'), cssColorVec3('--c-accent'))
    gl.uniform3fv(u('uAccent2'), cssColorVec3('--c-accent-2'))
    const uTime = u('uTime')
    const uResolution = u('uResolution')
    const uDpr = u('uDpr')
    const uOctaves = u('uOctaves')

    // Mode léger : fond calculé en moitié de résolution (il est flou, ça ne se voit pas) et limité à 30 images/s
    const resize = () => {
      const dpr = isLite() ? 0.5 : SHARED_DPR
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uOctaves, isLite() ? 3 : 5)
    }

    let frame = 0
    let last = 0
    const draw = () => {
      gl.uniform1f(uTime, sharedTime())
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = (now: number) => {
      if (!isLite() || now - last >= 33) {
        last = now
        draw()
      }
      frame = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    const offLite = onLiteChange(resize)
    if (prefersReducedMotion) draw()
    else frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      offLite()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 -z-10 h-full w-full" />
}
