import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { Reel } from './Reel'
import { FilmRibbon } from './FilmRibbon'
import { Statement } from './Statement'
import { ToolTiles } from './ToolTiles'
import { Dust } from './Dust'
import { STAGES } from './rig'
import { detectQuality } from './quality'
import { pointerState } from '../animations/scrollState'
import { gsap } from '../animations/gsap'

/**
 * Renders in the same tick as Lenis/ScrollTrigger (GSAP's ticker), after the
 * scroll position is updated, so section-anchored objects never lag the page
 * by a frame. Under reduced motion it renders only when the page scrolls.
 */
function Driver({ reduced }: { reduced: boolean }) {
  const advance = useThree((s) => s.advance)
  useEffect(() => {
    const render = () => advance(performance.now())
    if (!reduced) {
      gsap.ticker.add(render)
      return () => gsap.ticker.remove(render)
    }
    render()
    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
    }
  }, [advance, reduced])
  return null
}

/** The camera stays put (objects are locked to the page); a warm key light follows the pointer. */
function PointerLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.PointLight>(null)
  useFrame((_, dt) => {
    const delta = Math.min(dt, 1 / 20)
    const px = reduced ? 0 : pointerState.x
    const py = reduced ? 0 : pointerState.y
    if (light.current) {
      // A warm key light that follows the pointer — the scene "relights" as you move.
      light.current.position.x = THREE.MathUtils.damp(light.current.position.x, px * 6, 3, delta)
      light.current.position.y = THREE.MathUtils.damp(light.current.position.y, py * 4, 3, delta)
    }
  })
  return <pointLight ref={light} position={[0, 0, 4]} intensity={18} distance={14} decay={1.6} color="#ffb7b0" />
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(onReady)
  })
  return null
}

export default function Experience({ reduced, onReady }: { reduced: boolean; onReady: () => void }) {
  const [quality] = useState(detectQuality)
  const maxDpr = quality === 'high' ? 1.75 : 1.5
  const [dpr, setDpr] = useState(maxDpr)

  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-screen"
      style={{ pointerEvents: 'none' }}
      dpr={[1, dpr]}
      frameloop="never"
      camera={{ fov: 35, position: [0, 0, 10], near: 0.1, far: 60 }}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.setClearColor(0x000000, 0)
      }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />
      <ambientLight intensity={0.45} color="#f3d9d2" />
      <directionalLight position={[4, 5, 6]} intensity={1.7} color="#fff1e6" />
      <directionalLight position={[-6, -2, -3]} intensity={0.8} color="#8f3040" />
      <Environment resolution={quality === 'high' ? 128 : 64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff3ea" position={[0, 5, 2]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} color="#571822" position={[-6, 0, 1]} scale={[3, 8, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} color="#f0e6dc" position={[6, 1, 2]} scale={[2, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} color="#ffd9cf" position={[2, 2, 6]} scale={3} />
      </Environment>

      <Driver reduced={reduced} />
      <PointerLight reduced={reduced} />
      <FilmRibbon stage="hero" opacity={0.92} quality={quality} reduced={reduced} />
      <FilmRibbon stage="contact" opacity={0.7} quality={quality} reduced={reduced} />
      <Statement reduced={reduced} />
      {STAGES.map((stage) => (
        <Reel key={stage.key} stage={stage} quality={quality} reduced={reduced} />
      ))}
      <ToolTiles quality={quality} reduced={reduced} />
      <Dust count={quality === 'high' ? 520 : 180} reduced={reduced} />
      <FirstFrame onReady={onReady} />
    </Canvas>
  )
}
