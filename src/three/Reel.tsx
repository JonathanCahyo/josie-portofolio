import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { rig, LABELS } from './rig'
import { pointerState, scrollState } from '../animations/scrollState'
import { PALETTE, reelFaceTexture, ringLabelTexture } from './textures'
import type { Quality } from './quality'

/** Where the reel currently is, in world units — read by satellites (tiles, cylinder). */
export const reelWorld = { x: 0, y: 0, r: 1, halfW: 1, halfH: 1 }

const HOLES = 5

function buildReelGeometry() {
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

export function Reel({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const label = useRef<THREE.Mesh>(null)
  const labelMat = useRef<THREE.MeshBasicMaterial>(null)
  const shownLabel = useRef(0)
  const { viewport, camera } = useThree()

  const geometry = useMemo(buildReelGeometry, [])
  const faceMap = useMemo(() => reelFaceTexture(quality === 'high' ? 1024 : 512), [quality])
  const labelMaps = useMemo(
    () => LABELS.map((l, i) => ringLabelTexture(l, i === 0, quality === 'high' ? 1024 : 768)),
    [quality],
  )

  const materials = useMemo(() => {
    const face =
      quality === 'high'
        ? new THREE.MeshPhysicalMaterial({
            map: faceMap,
            roughness: 0.38,
            metalness: 0,
            clearcoat: 0.9,
            clearcoatRoughness: 0.22,
            sheen: 0.4,
            sheenColor: new THREE.Color('#ffe2d6'),
          })
        : new THREE.MeshStandardMaterial({ map: faceMap, roughness: 0.42 })
    const side = new THREE.MeshStandardMaterial({ color: '#d9c8bb', roughness: 0.5 })
    return [face, side]
  }, [faceMap, quality])

  useEffect(
    () => () => {
      geometry.dispose()
      faceMap.dispose()
      labelMaps.forEach((t) => t.dispose())
      materials.forEach((m) => m.dispose())
    },
    [geometry, faceMap, labelMaps, materials],
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const g = group.current
    const b = body.current
    if (!g || !b) return
    const delta = Math.min(dt, 1 / 20)
    const vp = viewport.getCurrentViewport(camera, tmp.set(0, 0, 0))
    const halfW = vp.width / 2
    const halfH = vp.height / 2
    const halfMin = Math.min(halfW, halfH)

    const tx = rig.x * halfW
    const ty = rig.y * halfH
    const ts = rig.s * halfMin
    // Reduced motion renders on demand, so snap instead of easing over frames.
    const ease = (from: number, to: number) => (reduced ? to : THREE.MathUtils.damp(from, to, 5, delta))
    g.position.x = ease(g.position.x, tx)
    g.position.y = ease(g.position.y, ty)
    const s = ease(g.scale.x, ts)
    g.scale.setScalar(s)

    const px = reduced ? 0 : pointerState.x
    const py = reduced ? 0 : pointerState.y
    g.rotation.x = ease(g.rotation.x, rig.rx - py * 0.28)
    g.rotation.y = ease(g.rotation.y, rig.ry + px * 0.38)

    if (!reduced) {
      const v = THREE.MathUtils.clamp(scrollState.velocity, -60, 60)
      b.rotation.z -= delta * (rig.spin + v * 0.02)
    }

    reelWorld.x = g.position.x
    reelWorld.y = g.position.y
    reelWorld.r = s
    reelWorld.halfW = halfW
    reelWorld.halfH = halfH

    // Cross-fade ring labels: opacity dips to 0 halfway between two labels, where the map swaps.
    const idx = Math.round(rig.label)
    if (idx !== shownLabel.current && labelMat.current) {
      shownLabel.current = idx
      labelMat.current.map = labelMaps[idx]
      labelMat.current.needsUpdate = true
    }
    if (labelMat.current) labelMat.current.opacity = 1 - Math.min(1, Math.abs(rig.label - idx) * 2.2)
    // The hero label (full circle) turns slowly; arc labels stay upright like the deck.
    if (label.current) {
      const target = idx === 0 && !reduced ? label.current.rotation.z - delta * 0.05 : 0
      label.current.rotation.z = idx === 0 ? target : THREE.MathUtils.damp(label.current.rotation.z, 0, 3, delta)
    }
  })

  return (
    <group ref={group}>
      <group ref={body}>
        <mesh geometry={geometry} material={materials} castShadow={false} />
        {/* axle */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.26, 32]} />
          <meshStandardMaterial color={PALETTE.primary} roughness={0.35} metalness={0.2} />
        </mesh>
      </group>
      <mesh ref={label} position={[0, 0, 0.081]}>
        <ringGeometry args={[0.7, 0.98, 128, 1]} />
        <meshBasicMaterial
          ref={labelMat}
          map={labelMaps[0]}
          transparent
          depthWrite={false}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
    </group>
  )
}
