// components/Threads.tsx
'use client'

import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";
import "./Threads.css";

interface ThreadsProps {
  /** RGB line color for the threads background */
  lineColor?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Threads({
  lineColor = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  className,
  style,
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ——— Setup WebGL ———
    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    // ——— Compile shaders ———
    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec3 uColor;
      uniform float uAmplitude;
      uniform float uDistance;
      uniform vec2 uMouse;
      #define PI 3.1415926538
      const int u_line_count = 40;
      const float u_line_width = 7.0;
      const float u_line_blur = 10.0;

      float Perlin2D(vec2 P) {
        vec2 Pi = floor(P);
        vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
        vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
        Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
        Pt += vec2(26.0,161.0).xyxy;
        Pt *= Pt;
        Pt = Pt.xzxz * Pt.yyww;
        vec4 hash_x = fract(Pt * (1.0/951.135664));
        vec4 hash_y = fract(Pt * (1.0/642.949883));
        vec4 grad_x = hash_x - 0.49999;
        vec4 grad_y = hash_y - 0.49999;
        vec4 grad_results = inversesqrt(grad_x*grad_x + grad_y*grad_y)
          * (grad_x*Pf_Pfmin1.xzxz + grad_y*Pf_Pfmin1.yyww);
        grad_results *= 1.4142135623730950;
        vec2 blend = Pf_Pfmin1.xy*Pf_Pfmin1.xy*Pf_Pfmin1.xy
          * (Pf_Pfmin1.xy*(Pf_Pfmin1.xy*6.0 - 15.0) + 10.0);
        vec4 blend2 = vec4(blend, vec2(1.0 - blend));
        return dot(grad_results, blend2.zxzx * blend2.wwyy);
      }

      float pixel(float count, vec2 resolution) {
        return (1.0 / max(resolution.x, resolution.y)) * count;
      }

      float lineFn(
        vec2 st,
        float width,
        float perc,
        float _offset,
        vec2 mouse,
        float time,
        float amplitude,
        float distance
      ) {
        float split_offset = perc * 0.4;
        float split_point = 0.1 + split_offset;
        float amp_norm = smoothstep(split_point, 0.7, st.x);
        float finalA = amp_norm * 0.5 * amplitude * (1.0 + (mouse.y - 0.5)*0.2);
        float tscaled = time/10.0 + (mouse.x - 0.5)*1.0;
        float blur = smoothstep(split_point, split_point+0.05, st.x) * perc;
        float xnoise = mix(
          Perlin2D(vec2(tscaled, st.x+perc)*2.5),
          Perlin2D(vec2(tscaled, st.x+tscaled)*3.5)/1.5,
          st.x*0.3
        );
        float y = 0.5 + (perc-0.5)*distance + xnoise/2.0*finalA;
        float start = smoothstep(
          y + width/2.0 + (u_line_blur*pixel(1.0, iResolution.xy)*blur),
          y,
          st.y
        );
        float end = smoothstep(
          y,
          y - width/2.0 - (u_line_blur*pixel(1.0, iResolution.xy)*blur),
          st.y
        );
        return clamp((start - end)*(1.0 - smoothstep(0.0,1.0,pow(perc,0.3))), 0.0,1.0);
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;
        float ls = 1.0;
        for (int i=0; i<u_line_count; i++) {
          float p = float(i)/float(u_line_count);
          ls *= (1.0 - lineFn(
            uv,
            u_line_width*pixel(1.0,iResolution.xy)*(1.0-p),
            p,
            PI*p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
          ));
        }
        float cVal = 1.0 - ls;
        fragColor = vec4(uColor*cVal, cVal);
      }

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime:      { value: 0 },
        iResolution:{ value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width/gl.canvas.height) },
        uColor:     { value: new Color(...lineColor) },
        uAmplitude: { value: amplitude },
        uDistance:  { value: distance },
        uMouse:     { value: new Float32Array([0.5,0.5]) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    // ——— Handle resize ———
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.iResolution.value.r = w;
      program.uniforms.iResolution.value.g = h;
      program.uniforms.iResolution.value.b = w/h;
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // ——— Mouse interaction ———
    const currentMouse: [number,number] = [0.5,0.5];
    let targetMouse: [number,number] = [0.5,0.5];

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      targetMouse = [
        (e.clientX - rect.left)/rect.width,
        1.0 - (e.clientY - rect.top)/rect.height,
      ];
    };
    const onMouseLeave = () => { targetMouse = [0.5,0.5]; };

    if (enableMouseInteraction) {
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
    }

    // ——— Render loop ———
    const update = (t: number) => {
      if (enableMouseInteraction && program.uniforms.uMouse) {
        const s = 0.05;
        currentMouse[0] += s*(targetMouse[0]-currentMouse[0]);
        currentMouse[1] += s*(targetMouse[1]-currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      }
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    };
    animationFrameId.current = requestAnimationFrame(update);

    // ——— Cleanup ———
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", handleResize);
      if (enableMouseInteraction) {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [lineColor, amplitude, distance, enableMouseInteraction]);

  return <div ref={containerRef} className={`threads-container ${className||''}`} style={style} />;
}
