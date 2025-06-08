// components/MetallicPaint.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
"use client";

import { useEffect, useRef, useState } from "react";
import './MetallicPaint.css';

const defaultParams = {
  patternScale: 2,
  refraction: 0.015,
  edge: 1,
  patternBlur: 0.005,
  liquid: 0.07,
  speed: 0.3,
};

export function parseLogoImage(file: Blob) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  return new Promise<{
    imageData: ImageData;
    pngBlob: Blob;
  }>((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error("Invalid file or context"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      // resize logic...
      const MAX = 1000, MIN = 500;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX || w < MIN || h < MIN) {
        const ratio = w > h ? MAX / w : MAX / h;
        if (w < MIN || h < MIN) {
          const smallRatio = w < h ? MIN / w : MIN / h;
          w = Math.round(w * smallRatio);
          h = Math.round(h * smallRatio);
        } else {
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
      }
      canvas.width = w;
      canvas.height = h;

      // draw into shape mask:
      const shapeCanvas = document.createElement("canvas");
      shapeCanvas.width = w;
      shapeCanvas.height = h;
      const sctx = shapeCanvas.getContext("2d")!;
      sctx.drawImage(img, 0, 0, w, h);
      const { data } = sctx.getImageData(0, 0, w, h);
      const shapeMask = new Array(w*h).fill(false);
      for (let i = 0; i < w*h; i++) {
        const a = data[i*4+3];
        shapeMask[i] = a !== 0 && !(data[i*4] === 255 && data[i*4+1] === 255 && data[i*4+2] === 255);
      }

      // compute boundary & interior masks, solve u Laplace etc...
      // (SKIPPING details here for brevity; copy your full algorithm)

      // after computing `outImg` ImageData:
      // (pretend `outImg` is the final ImageData)
      const outImg = ctx.createImageData(w, h);
      // ... fill outImg.data as per your code ...

      ctx.putImageData(outImg, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("PNG blob failed"));
        resolve({ imageData: outImg, pngBlob: blob });
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_position; out vec2 vUv;
void main() {
  vUv = .5*(a_position+1.);
  gl_Position = vec4(a_position,0,1);
}`;

const liquidFragSource = `#version 300 es
precision mediump float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D u_image_texture;
uniform float u_time, u_ratio, u_img_ratio;
uniform float u_patternScale, u_refraction, u_edge, u_patternBlur, u_liquid;
// ... your full GLSL code ...
void main() {
  // ... your shader logic ...
}`;

export default function MetallicPaint({
  imageData,
  params = defaultParams,
}: {
  imageData: ImageData;
  params?: typeof defaultParams;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext|null>(null);
  const [uniforms, setUniforms] = useState<any>({});
  const totalTime = useRef(0);
  const lastTime = useRef(0);

  // Initialize WebGL, compile shaders, link program, get uniforms
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!context) return;
    // ... your initShader logic goes here ...
    setGl(context);
  }, []);

  // Upload texture & render loop
  useEffect(() => {
    if (!gl || !uniforms || !imageData) return;
    // ... your texture + animation loop ...
  }, [gl, uniforms, imageData, params.speed]);

  // handle resize & params updates
  useEffect(() => {
    if (!gl || !uniforms) return;
    // update uniforms for params...
  }, [gl, uniforms, params]);

  return <canvas ref={canvasRef} className="paint-container" />;
}
