import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { toolkitAnchor } from './rig'
import { pointerState, scrollState } from '../animations/scrollState'
import { statementTexture } from './textures'
import { toolkit } from '../data/about'

const ARC = 2.1 // radians of cylinder carrying the text
const TEXTURE_ASPECT = 4096 / 900 // see statementTexture()

/**
 * The deck's warped "GRAPHIC DESIGNER" type, made literal: the words are
 * printed on the front of a cylinder standing behind the reel.
 */
export function Statement({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const map = useMemo(() => statementTexture(toolkit.statement), [])
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(1, 1, 1, 96, 1, true, -ARC / 2, ARC),
    [],
  )
  useEffect(() => () => (map.dispose(), geometry.dispose()), [map, geometry])

  useFrame((_, dt) => {
    const g = group.current
    const m = mat.current
    if (!g || !m) return
    const delta = Math.min(dt, 1 / 20)
    m.opacity = THREE.MathUtils.damp(m.opacity, toolkitAnchor.vis, 6, delta)
    g.visible = m.opacity > 0.01
    if (!g.visible) return

    const { halfW, halfH } = toolkitAnchor
    // radius so the visible arc spans ~95% of the viewport width; height follows the
    // texture's aspect (with the deck's tall stretch) so portrait screens don't distort it
    const R = (halfW * 2 * 0.95) / (2 * Math.sin(ARC / 2))
    const H = Math.min(halfH * 2 * 0.72, ((R * ARC) / TEXTURE_ASPECT) * 1.7)
    g.scale.set(R, H, R)
    g.position.set(0, toolkitAnchor.y, -R - 0.9)
    const sway = reduced ? 0 : pointerState.x * 0.08 + THREE.MathUtils.clamp(scrollState.velocity, -40, 40) * 0.002
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, sway + (1 - toolkitAnchor.vis) * 0.6, 3, delta)
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={mat} map={map} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
