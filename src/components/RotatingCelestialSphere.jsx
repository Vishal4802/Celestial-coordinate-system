import React, { useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

const R = 0.8

// Helper to build dotted geometry
function buildDottedGeometry(points) {
  const geo = new THREE.BufferGeometry()
  geo.setFromPoints(points)
  return geo
}

// Dotted Circle component
function DottedCircle({ radius, rotation = [0, 0, 0], color, segments = 64 }) {
  const _v1 = useRef(new THREE.Vector3())
  const _v2 = useRef(new THREE.Vector3())
  const geometry = useMemo(() => {
    const pts = []
    const step = Math.PI * 2 / segments
    for (let i = 0; i < segments; i++) {
      const a1 = i * step
      const a2 = (i + 0.42) * step
      pts.push(new THREE.Vector3(Math.cos(a1) * radius, 0, Math.sin(a1) * radius))
      pts.push(new THREE.Vector3(Math.cos(a2) * radius, 0, Math.sin(a2) * radius))
    }
    return buildDottedGeometry(pts)
  }, [radius, segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry} rotation={rotation}>
      <lineBasicMaterial color={color} linewidth={1} />
    </lineSegments>
  )
}

// Dotted Line component
function DottedLine({ start, end, color, segments = 28 }) {
  const _v1 = useRef(new THREE.Vector3())
  const _v2 = useRef(new THREE.Vector3())
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const pts = []
    for (let i = 0; i < segments; i++) {
      pts.push(_v1.current.clone().lerpVectors(s, e, i / segments))
      pts.push(_v2.current.clone().lerpVectors(s, e, (i + 0.52) / segments))
    }
    return buildDottedGeometry(pts)
  }, [start[0], start[1], start[2], end[0], end[1], end[2], segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={1} />
    </lineSegments>
  )
}

// Main rotating sphere scene
function RotatingSphereScene() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.25
    }
  })

  // Create ring points for horizon
  const ringPoints = useMemo(() => {
    return Array.from({ length: 65 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2
      return [Math.cos(a) * R, 0, Math.sin(a) * R]
    })
  }, [])

  return (
    <group>
      {/* Background sphere (light blue tint) */}
      <mesh>
        <sphereGeometry args={[R, 60, 60]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Rotating group */}
      <group ref={groupRef}>
        {/* Horizon/Equator line */}
        <Line points={ringPoints} color="#00ff88" lineWidth={1.5} />

        {/* Ecliptic (tilted) */}
        <DottedCircle radius={R} rotation={[0.4091, 0, 0]} color="#ff9900" segments={80} />

        {/* Meridian line (vertical) */}
        <DottedCircle radius={R} rotation={[0, 0, Math.PI / 2]} color="#ffcc00" segments={80} />

        {/* Celestial poles (vertical axis) */}
        <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />

        {/* Cardinal directions labels */}
        <Text position={[0, 0.05, R + 0.12]} fontSize={0.08} color="white" outlineWidth={0.006} outlineColor="#000" anchorX="center">
          N
        </Text>
        <Text position={[0, 0.05, -R - 0.12]} fontSize={0.08} color="white" outlineWidth={0.006} outlineColor="#000" anchorX="center">
          S
        </Text>
        <Text position={[R + 0.12, 0.05, 0]} fontSize={0.08} color="white" outlineWidth={0.006} outlineColor="#000" anchorX="center">
          W
        </Text>
        <Text position={[-R - 0.12, 0.05, 0]} fontSize={0.08} color="white" outlineWidth={0.006} outlineColor="#000" anchorX="center">
          E
        </Text>

        {/* Pole labels */}
        <Text position={[0, R + 0.05, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000" anchorX="center">
          NCP
        </Text>
        <Text position={[0, -R - 0.05, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000" anchorX="center">
          SCP
        </Text>

      </group>

      {/* Central point */}
      <mesh>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
}

export default function RotatingCelestialSphere() {
  return (
    <Canvas
      camera={{ position: [1.5, 1, 1.5], fov: 45 }}
      frameloop="always"
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <RotatingSphereScene />
      <OrbitControls makeDefault minDistance={1.2} maxDistance={3} autoRotate={false} />
    </Canvas>
  )
}
