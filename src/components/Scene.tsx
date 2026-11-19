import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type P3 = [number, number, number]

function Particles() {
  const ref = useRef<THREE.Points>(null)
  const pos = useMemo(() => {
    const a = new Float32Array(1800 * 3)
    for (let i = 0; i < a.length; i++) a[i] = (Math.random() - 0.5) * 14
    return a
  }, [])
  useFrame(({ pointer }, dt) => {
    const r = ref.current
    if (!r) return
    r.rotation.y += dt * 0.05
    r.rotation.x += (pointer.y * 0.3 - r.rotation.x) * 0.03
    r.position.x += (pointer.x * 0.6 - r.position.x) * 0.03
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={pos.length / 3} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#5ad1c5" transparent opacity={0.75} />
    </points>
  )
}

export function HeroCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6] }} aria-hidden>
      <Particles />
    </Canvas>
  )
}

function Dot({ p, color, label, r }: { p: P3; color: string; label: string; r: number }) {
  const ref = useRef<THREE.Group>(null)
  const target = useMemo(() => new THREE.Vector3(...p), [p])
  useFrame(() => ref.current?.position.lerp(target, 0.12))
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[r, 24, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <span className="whitespace-nowrap rounded bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-200">{label}</span>
      </Html>
    </group>
  )
}

/** Documentos y consulta proyectados con PCA. El último punto es la consulta. */
export function VectorSpace({ pts, scores }: { pts: P3[]; scores: number[] }) {
  const q = pts[pts.length - 1]
  return (
    <Canvas camera={{ position: [4, 3, 6] }} aria-label="Documentos y consulta en el espacio vectorial">
      <gridHelper args={[8, 8, '#26304a', '#1a2238']} />
      {pts.slice(0, -1).map((p, i) => {
        const s = Math.max(0, scores[i] ?? 0)
        const c = new THREE.Color('#3a4766').lerp(new THREE.Color('#5ad1c5'), s)
        return (
          <group key={i}>
            <Line points={[[0, 0, 0], p]} color={'#' + c.getHexString()} lineWidth={1} />
            <Dot p={p} color={'#' + c.getHexString()} label={`D${i + 1}`} r={0.08 + s * 0.12} />
          </group>
        )
      })}
      {q && <Dot p={q} color="#f2b84b" label="consulta" r={0.18} />}
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  )
}
