import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { rig } from './rig'
import { pointerState, scrollState } from '../animations/scrollState'
import type { Quality } from './quality'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uLength;
  uniform float uAmp;
  uniform float uWave;
  varying vec2 vUv;
  varying float vShade;

  vec3 curve(float t) {
    float a = t * 6.2831 * 0.9 + uTime * 0.12 + uScroll * 4.0;
    float x = (t - 0.5) * uLength;
    float y = sin(a) * uAmp + sin(t * 14.0 + uTime * 0.7) * 0.12 * uWave;
    float z = cos(a * 0.85) * uAmp * 1.1 - 2.4;
    return vec3(x, y, z);
  }

  void main() {
    vUv = uv;
    float t = uv.x;
    vec3 p = curve(t);
    vec3 T = normalize(curve(t + 0.002) - p);
    vec3 B = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
    vec3 N = cross(B, T);
    float twist = t * 4.2 + uTime * 0.18 + uScroll * 2.0;
    vec3 side = cos(twist) * B + sin(twist) * N;
    vec3 pos = p + side * position.y;
    vec3 normal = normalize(cross(T, side));
    vShade = 0.55 + 0.45 * abs(dot(normal, normalize(vec3(0.4, 0.6, 1.0))));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uHoles;
  uniform vec3 uBase;
  uniform vec3 uFrame;
  uniform vec3 uCream;
  varying vec2 vUv;
  varying float vShade;

  void main() {
    float v = vUv.y;
    float edge = abs(v - 0.5);
    // sprocket holes on both edges
    float cell = fract(vUv.x * uHoles);
    if (edge > 0.36 && edge < 0.45 && cell > 0.28 && cell < 0.72) discard;

    vec3 col = uBase;
    // picture frames between the sprocket rows; a frame every 4 holes
    float frameCell = fract(vUv.x * uHoles / 4.0);
    float inFrame = step(edge, 0.3) * step(0.04, frameCell) * step(frameCell, 0.96);
    col = mix(col, uFrame, inFrame);
    // hairline frame borders in cream
    float border = inFrame * (1.0 - step(0.006, abs(edge - 0.3))) ;
    col = mix(col, uCream, border * 0.6);
    col *= vShade;

    float fade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    gl_FragColor = vec4(col, uOpacity * fade);
    #include <colorspace_fragment>
  }
`

export function FilmRibbon({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  const segments = quality === 'high' ? 420 : 160
  const length = Math.max(14, viewport.width * 1.7)

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 0.62, segments, 1), [segments])
  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uLength: { value: length },
      uAmp: { value: 1.6 },
      uWave: { value: 0 },
      uOpacity: { value: 0 },
      uHoles: { value: 64 },
      uBase: { value: new THREE.Color('#1E080C') },
      uFrame: { value: new THREE.Color('#571822') },
      uCream: { value: new THREE.Color('#F0E6DC') },
    }),
    // uLength is kept current in useFrame; the uniforms object itself must stay stable
    [],
  )

  useFrame((_, dt) => {
    const m = mat.current
    if (!m) return
    const u = m.uniforms
    const delta = Math.min(dt, 1 / 20)
    if (!reduced) u.uTime.value += delta
    u.uLength.value = Math.max(14, viewport.width * 1.7)
    u.uHoles.value = Math.round(u.uLength.value * 4.2)
    u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, scrollState.progress, 4, delta)
    pointerState.speed = THREE.MathUtils.damp(pointerState.speed, 0, 2.5, delta)
    const wave = reduced ? 0 : pointerState.speed * 2.5 + Math.min(1, Math.abs(scrollState.velocity) / 30)
    u.uWave.value = THREE.MathUtils.damp(u.uWave.value, wave, 3, delta)
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, rig.ribbon * 0.92, 3, delta)
  })

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={-1}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
