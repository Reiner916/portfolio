import { useEffect, useRef } from 'react'
import { backgroundGlsl, cssColorVec3, sharedTime, SHARED_DPR } from '../lib/backgroundShader'
import { prefersReducedMotion } from '../lib/motion'

const VERTEX = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`
const FRAGMENT = `precision highp float;\n${backgroundGlsl}\nvoid main() { gl_FragColor = vec4(siteBackground(gl_FragCoord.xy), 1.0); }`

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
    gl.uniform1f(u('uDpr'), SHARED_DPR)
    const uTime = u('uTime')
    const uResolution = u('uResolution')

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * SHARED_DPR)
      canvas.height = Math.round(window.innerHeight * SHARED_DPR)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
    }

    let frame = 0
    const draw = () => {
      gl.uniform1f(uTime, sharedTime())
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = () => {
      draw()
      frame = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    if (prefersReducedMotion) draw()
    else loop()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 -z-10 h-full w-full" />
}
