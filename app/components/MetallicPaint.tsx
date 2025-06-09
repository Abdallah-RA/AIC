'use client'

import { useEffect, useRef, useState } from 'react'
import './MetallicPaint.css'

const defaultParams = {
  patternScale: 2,
  refraction: 0.015,
  edge: 1,
  patternBlur: 0.005,
  liquid: 0.07,
  speed: 0.3,
}

export function parseLogoImage(file: Blob) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  return new Promise<{ imageData: ImageData; pngBlob: Blob }>((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error('Invalid file or context'))
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = function () {
      const MAX = 1000, MIN = 500
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > MAX || h > MAX || w < MIN || h < MIN) {
        const ratio = w > h ? MAX / w : MAX / h
        if (w < MIN || h < MIN) {
          const smallRatio = w < h ? MIN / w : MIN / h
          w = Math.round(w * smallRatio)
          h = Math.round(h * smallRatio)
        } else {
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
      }
      canvas.width = w
      canvas.height = h

      const shapeCanvas = document.createElement('canvas')
      shapeCanvas.width = w
      shapeCanvas.height = h
      const sctx = shapeCanvas.getContext('2d')!
      sctx.drawImage(img, 0, 0, w, h)
      const { data } = sctx.getImageData(0, 0, w, h)
      const shapeMask = new Array(w * h).fill(false)
      for (let i = 0; i < w * h; i++) {
        const a = data[i * 4 + 3]
        shapeMask[i] =
          a !== 0 &&
          !(
            data[i * 4] === 255 &&
            data[i * 4 + 1] === 255 &&
            data[i * 4 + 2] === 255
          )
      }

      // TODO: compute boundary & interior masks, solve Laplace, fill outImg
      const outImg = ctx.createImageData(w, h)
      // ... fill outImg.data as per your algorithm ...

      ctx.putImageData(outImg, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('PNG blob failed'))
          resolve({ imageData: outImg, pngBlob: blob })
        },
        'image/png'
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

type Uniforms = {
  u_time: WebGLUniformLocation
  u_ratio: WebGLUniformLocation
  u_img_ratio: WebGLUniformLocation
  u_patternScale: WebGLUniformLocation
  u_refraction: WebGLUniformLocation
  u_edge: WebGLUniformLocation
  u_patternBlur: WebGLUniformLocation
  u_liquid: WebGLUniformLocation
  u_image_texture: WebGLUniformLocation
}

export default function MetallicPaint({
  imageData,
  params = defaultParams,
}: {
  imageData: ImageData
  params?: typeof defaultParams
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null)
  const [uniforms, setUniforms] = useState<Partial<Uniforms>>({})

  // Initialize WebGL, compile shaders, link program, get uniforms
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('webgl2', {
      antialias: true,
      alpha: true,
    })
    if (!context) return

    // Compile vertex shader inline
    const vs = context.createShader(context.VERTEX_SHADER)!
    context.shaderSource(
      vs,
      `#version 300 es
precision mediump float;
in vec2 a_position; out vec2 vUv;
void main() {
  vUv = .5*(a_position+1.);
  gl_Position = vec4(a_position,0,1);
}`
    )
    context.compileShader(vs)

    // Compile fragment shader inline
    const fs = context.createShader(context.FRAGMENT_SHADER)!
    context.shaderSource(
      fs,
      `#version 300 es
precision mediump float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D u_image_texture;
uniform float u_time, u_ratio, u_img_ratio;
uniform float u_patternScale, u_refraction, u_edge, u_patternBlur, u_liquid;
// ... your full GLSL code ...
void main() {
  // ... your shader logic ...
}`
    )
    context.compileShader(fs)

    // Link program
    const program = context.createProgram()!
    context.attachShader(program, vs)
    context.attachShader(program, fs)
    context.linkProgram(program)
    context.useProgram(program)

    // Get uniform locations
    const u_time = context.getUniformLocation(program, 'u_time')!
    const u_ratio = context.getUniformLocation(program, 'u_ratio')!
    const u_img_ratio = context.getUniformLocation(program, 'u_img_ratio')!
    const u_patternScale = context.getUniformLocation(
      program,
      'u_patternScale'
    )!
    const u_refraction = context.getUniformLocation(program, 'u_refraction')!
    const u_edge = context.getUniformLocation(program, 'u_edge')!
    const u_patternBlur = context.getUniformLocation(
      program,
      'u_patternBlur'
    )!
    const u_liquid = context.getUniformLocation(program, 'u_liquid')!
    const u_image_texture = context.getUniformLocation(
      program,
      'u_image_texture'
    )!

    setUniforms({
      u_time,
      u_ratio,
      u_img_ratio,
      u_patternScale,
      u_refraction,
      u_edge,
      u_patternBlur,
      u_liquid,
      u_image_texture,
    })
    setGl(context)
  }, [imageData])

  // Upload texture & start render loop
  useEffect(() => {
    if (!gl || !uniforms.u_time || !uniforms.u_image_texture) return
    // TODO: create texture from imageData, bind to u_image_texture
    // TODO: implement animation loop using requestAnimationFrame, update u_time uniform
  }, [gl, uniforms, imageData, params.speed])

  // Update uniforms when params change
  useEffect(() => {
    if (!gl) return
    gl.useProgram(gl.getParameter(gl.CURRENT_PROGRAM))
    if (uniforms.u_patternScale)
      gl.uniform1f(uniforms.u_patternScale, params.patternScale)
    if (uniforms.u_refraction)
      gl.uniform1f(uniforms.u_refraction, params.refraction)
    if (uniforms.u_edge) gl.uniform1f(uniforms.u_edge, params.edge)
    if (uniforms.u_patternBlur)
      gl.uniform1f(uniforms.u_patternBlur, params.patternBlur)
    if (uniforms.u_liquid)
      gl.uniform1f(uniforms.u_liquid, params.liquid)
  }, [gl, uniforms, params])

  return <canvas ref={canvasRef} className="paint-container" />
}
