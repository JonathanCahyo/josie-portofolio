import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../animations/scrollState'

/** Projector-beam dust: a few hundred specks drifting through the scene. */
export function Dust({ count, reduced }: { count: number; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 22
      p[i * 3 + 1] = (Math.random() - 0.5) * 14
      p[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, dt) => {
    if (!ref.current || reduced) return
    const delta = Math.min(dt, 1 / 20)
    ref.current.rotation.y += delta * 0.01
    ref.current.position.y = (ref.current.position.y + delta * (0.05 + scrollState.velocity * 0.004)) % 4
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#F0E6DC"
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.38}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
