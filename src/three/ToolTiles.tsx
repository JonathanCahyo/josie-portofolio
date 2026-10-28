import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { toolkitAnchor } from './rig'
import { pointerState } from '../animations/scrollState'
import { PALETTE, tileTexture } from './textures'
import { toolkit } from '../data/about'
import type { Quality } from './quality'

/** Glossy tool tiles orbiting the reel; the pointer pushes them aside. */
export function ToolTiles({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const tiles = useRef<Array<THREE.Group | null>>([])
  const push = useMemo(() => toolkit.tools.map(() => new THREE.Vector2()), [])
  const maps = useMemo(() => toolkit.tools.map((t, i) => tileTexture(t.mono, t.name, i % 2 === 1)), [])
  useEffect(() => () => maps.forEach((m) => m.dispose()), [maps])
  const time = useRef(0)

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const delta = Math.min(dt, 1 / 20)
    if (!reduced) time.current += delta
    const vis = toolkitAnchor.vis
    g.visible = vis > 0.01
    if (!g.visible) return

    const { x, y, r, halfW, halfH } = toolkitAnchor
    const rx = Math.min(r * 2.3, halfW * 0.82)
    const ry = Math.min(r * 1.45, halfH * 0.75)
    const size = Math.min(halfW, halfH) * 0.26
    const px = pointerState.x * halfW
    const py = pointerState.y * halfH
    const n = toolkit.tools.length

    tiles.current.forEach((t, i) => {
      if (!t) return
      const a = (i / n) * Math.PI * 2 + time.current * 0.14 + (1 - vis) * 1.2
      const bx = x + Math.cos(a) * rx * (0.6 + vis * 0.4)
      const by = y + Math.sin(a) * ry * (0.6 + vis * 0.4)
      const bz = Math.sin(a) * 0.9 + 0.6

      // pointer repulsion
      const dx = bx - px
      const dy = by - py
      const d = Math.hypot(dx, dy)
      const reach = size * 2.2
      const p = push[i]
      const tx = !reduced && d < reach ? (dx / (d || 1)) * (reach - d) * 0.9 : 0
      const ty = !reduced && d < reach ? (dy / (d || 1)) * (reach - d) * 0.9 : 0
      p.x = THREE.MathUtils.damp(p.x, tx, 6, delta)
      p.y = THREE.MathUtils.damp(p.y, ty, 6, delta)

      t.position.set(bx + p.x, by + p.y, bz)
      t.scale.setScalar(size * vis)
      t.rotation.x = -pointerState.y * 0.3 + Math.sin(time.current * 0.6 + i) * 0.12
      t.rotation.y = pointerState.x * 0.4 + Math.cos(time.current * 0.5 + i) * 0.15 - (bx - x) / (rx * 4)
      t.rotation.z = Math.sin(a) * 0.12
    })
  })

  return (
    <group ref={group} visible={false}>
      {toolkit.tools.map((tool, i) => {
        const dark = i % 2 === 1
        return (
          <group key={tool.name} ref={(el) => void (tiles.current[i] = el)}>
            <RoundedBox args={[1, 1, 0.28]} radius={0.16} smoothness={quality === 'high' ? 5 : 3}>
              {quality === 'high' ? (
                <meshPhysicalMaterial
                  color={dark ? PALETTE.primary : PALETTE.cream}
                  roughness={0.25}
                  clearcoat={1}
                  clearcoatRoughness={0.15}
                />
              ) : (
                <meshStandardMaterial color={dark ? PALETTE.primary : PALETTE.cream} roughness={0.3} />
              )}
            </RoundedBox>
            <mesh position={[0, 0, 0.145]}>
              <planeGeometry args={[0.86, 0.86]} />
              <meshBasicMaterial map={maps[i]} transparent toneMapped={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
