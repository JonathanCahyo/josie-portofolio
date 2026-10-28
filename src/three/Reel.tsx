import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LABELS, isMobileLayout, presence, stageElement, toolkitAnchor, type Stage } from './rig'
import { pointerState, scrollState } from '../animations/scrollState'
import { filmPackTexture, reelFaceTexture, ringLabelTexture } from './textures'
import type { Quality } from './quality'

const HOLES = 5
const FACE_Z = 0.075 // front of the extruded face
const SPOOL_GAP = 0.2 // distance between front and back flange

function buildFlangeGeometry() {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false)
  for (let i = 0; i < HOLES; i++) {
    const a = Math.PI / 2 + (i / HOLES) * Math.PI * 2
    const hole = new THREE.Path()
    hole.absarc(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0.17, 0, Math.PI * 2, true)
    shape.holes.push(hole)
  }
  const hub = new THREE.Path()
  hub.absarc(0, 0, 0.06, 0, Math.PI * 2, true)
  shape.holes.push(hub)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 72,
  })
  geo.translate(0, 0, -0.05)
  // Planar UVs over the unit disc so the face texture maps 1:1.
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) * 0.5 + 0.5, pos.getY(i) * 0.5 + 0.5)
  uv.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/** Shared across every stage reel. */
let sharedGeometry: THREE.ExtrudeGeometry | null = null
const flangeGeometry = () => (sharedGeometry ??= buildFlangeGeometry())

/**
 * A film reel that belongs to one section. Each frame it reads its section's
 * box and sits at the same spot inside it, so it scrolls exactly with the
 * page; clipping planes keep it inside the section's edges.
 */
export function Reel({ stage, quality, reduced }: { stage: Stage; quality: Quality; reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const label = useRef<THREE.Mesh>(null)
  const geometry = flangeGeometry()

  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)], [])

  const textures = useMemo(() => {
    const hi = quality === 'high'
    return {
      face: reelFaceTexture(hi ? 1024 : 512),
      label: ringLabelTexture(LABELS[stage.label], stage.label === 0, hi ? 1024 : 768),
      film: filmPackTexture(hi ? 512 : 256),
    }
  }, [quality, stage.label])

  const materials = useMemo(() => {
    const face =
      quality === 'high'
        ? new THREE.MeshPhysicalMaterial({
            map: textures.face,
            roughness: 0.38,
            clearcoat: 0.9,
            clearcoatRoughness: 0.22,
            sheen: 0.4,
            sheenColor: new THREE.Color('#ffe2d6'),
          })
        : new THREE.MeshStandardMaterial({ map: textures.face, roughness: 0.42 })
    const side = new THREE.MeshStandardMaterial({ color: '#d9c8bb', roughness: 0.5 })
    const back = new THREE.MeshStandardMaterial({ color: '#cdb9ab', roughness: 0.55 })
    const film = new THREE.MeshStandardMaterial({ map: textures.film, roughness: 0.45, metalness: 0.15 })
    const axle = new THREE.MeshStandardMaterial({ color: '#2a1015', roughness: 0.3, metalness: 0.6 })
    const ring = new THREE.MeshBasicMaterial({
      map: textures.label,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    })
    const all = { face, side, back, film, axle, ring }
    Object.values(all).forEach((m) => (m.clippingPlanes = clip))
    return all
  }, [quality, textures, clip])

  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(materials).forEach((m) => m.dispose())
    },
    [textures, materials],
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const g = group.current
    const b = body.current
    const el = stageElement(stage.key)
    if (!g || !b || !el) return
    const delta = Math.min(dt, 1 / 20)
    const { width: vw, height: vh } = state.size
    const rect = el.getBoundingClientRect()

    // Off-screen sections don't render their reel at all.
    g.visible = rect.bottom > -vh * 0.25 && rect.top < vh * 1.25
    if (stage.key === 'toolkit') toolkitAnchor.vis = presence(rect, vh)
    if (!g.visible) return

    const vp = state.viewport.getCurrentViewport(state.camera, tmp.set(0, 0, 0))
    const halfW = vp.width / 2
    const halfH = vp.height / 2
    const toWorldY = (py: number) => -((py / vh) * 2 - 1) * halfH
    const pose = isMobileLayout() ? stage.mobile : stage.desktop

    // Same spot inside the section's first screen, so it moves 1:1 with the page.
    const cx = vw * (0.5 + pose.x * 0.5)
    const cy = rect.top + vh * (0.5 - pose.y * 0.5)
    g.position.set((cx / vw) * 2 * halfW - halfW, toWorldY(cy), 0)
    const s = pose.s * Math.min(halfW, halfH)
    g.scale.setScalar(s)

    // keep the reel inside its section's top and bottom edges
    clip[0].constant = toWorldY(rect.top)
    clip[1].constant = -toWorldY(rect.bottom)

    const px = reduced ? 0 : pointerState.x
    const py = reduced ? 0 : pointerState.y
    const ease = (from: number, to: number) => (reduced ? to : THREE.MathUtils.damp(from, to, 5, delta))
    g.rotation.x = ease(g.rotation.x, pose.rx - py * 0.22)
    g.rotation.y = ease(g.rotation.y, pose.ry + px * 0.3)

    if (!reduced) {
      // idle turn, plus a roll in the direction the page moves
      const v = THREE.MathUtils.clamp(scrollState.velocity, -60, 60)
      b.rotation.z -= delta * (pose.spin + v * 0.02)
      // the hero's full-circle label drifts slowly; arc labels stay upright like the deck
      if (stage.label === 0 && label.current) label.current.rotation.z -= delta * 0.05
    }

    if (stage.key === 'toolkit') {
      toolkitAnchor.x = g.position.x
      toolkitAnchor.y = g.position.y
      toolkitAnchor.r = s
      toolkitAnchor.halfW = halfW
      toolkitAnchor.halfH = halfH
    }
  })

  return (
    <group ref={group} visible={false}>
      <group ref={body}>
        {/* front flange */}
        <mesh geometry={geometry} material={[materials.face, materials.side]} />
        {/* wound film between the flanges — what you see through the windows */}
        <mesh position={[0, 0, -SPOOL_GAP / 2]} rotation={[Math.PI / 2, 0, 0]} material={[materials.axle, materials.film, materials.film]}>
          <cylinderGeometry args={[0.62, 0.62, SPOOL_GAP - 0.1, 64]} />
        </mesh>
        {/* back flange */}
        <mesh geometry={geometry} position={[0, 0, -SPOOL_GAP]} material={[materials.back, materials.side]} />
        {/* axle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -SPOOL_GAP / 2]} material={materials.axle}>
          <cylinderGeometry args={[0.07, 0.07, SPOOL_GAP + 0.24, 24]} />
        </mesh>
      </group>
      <mesh ref={label} position={[0, 0, FACE_Z + 0.006]} material={materials.ring}>
        <ringGeometry args={[0.7, 0.98, 128, 1]} />
      </mesh>
    </group>
  )
}
