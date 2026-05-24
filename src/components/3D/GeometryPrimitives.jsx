import React, { useMemo, useEffect, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildDottedGeometry, _v1, _v2, R } from '../../constants/3d'

export const DottedLine = memo(function DottedLine({ start, end, color, segments = 28 }) {
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const pts = []
    for (let i = 0; i < segments; i++) {
      pts.push(_v1.clone().lerpVectors(s, e, i / segments))
      pts.push(_v2.clone().lerpVectors(s, e, (i + 0.52) / segments))
    }
    return buildDottedGeometry(pts)
  }, [start[0], start[1], start[2], end[0], end[1], end[2], segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
})

export const DottedCircle = memo(function DottedCircle({ radius, rotation = [0, 0, 0], color, segments = 64 }) {
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
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
})

export const DottedArc = memo(function DottedArc({ fromVec, toVec, radius, color, segments = 44 }) {
  const geometry = useMemo(() => {
    const f = fromVec.clone().normalize()
    const t = toVec.clone().normalize()
    const pts = []
    for (let i = 0; i < segments; i++) {
      pts.push(_v1.clone().lerpVectors(f, t, i / segments).normalize().multiplyScalar(radius))
      pts.push(_v2.clone().lerpVectors(f, t, (i + 0.46) / segments).normalize().multiplyScalar(radius))
    }
    return buildDottedGeometry(pts)
  }, [fromVec.x, fromVec.y, fromVec.z, toVec.x, toVec.y, toVec.z, radius, segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
})

export const DeclinationArc = memo(function DeclinationArc({ radius, starDeclination }) {
  const geometry = useMemo(() => {
    const segs = 44
    const equatorPt = new THREE.Vector3(0, 0, radius)
    const starPt = new THREE.Vector3(0, Math.sin(starDeclination) * radius, Math.cos(starDeclination) * radius)
    const pts = []
    for (let i = 0; i < segs; i++) {
      pts.push(_v1.clone().lerpVectors(equatorPt, starPt, i / segs).normalize().multiplyScalar(radius))
      pts.push(_v2.clone().lerpVectors(equatorPt, starPt, (i + 0.46) / segs).normalize().multiplyScalar(radius))
    }
    return buildDottedGeometry(pts)
  }, [radius, starDeclination])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ff00ff" />
    </lineSegments>
  )
})
